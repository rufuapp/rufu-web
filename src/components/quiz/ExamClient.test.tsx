import { act, fireEvent, render, screen, within } from '@testing-library/react';
import { ExamClient, domainsFromParams } from './ExamClient';
import { getQuestionSet } from '@/content/question-sets';
import { questionsForExam } from '@/content/questions';
import { STORAGE_KEY, loadProgress } from '@/lib/quiz/progress';

let mockParams = new URLSearchParams();
jest.mock('next/navigation', () => ({
  useSearchParams: () => mockParams,
}));

const set = getQuestionSet('claude-api')!;
const questions = questionsForExam('claude-api');

function currentQuestion() {
  const text = screen.getByRole('heading', { level: 2, name: (n) => questions.some((q) => q.question === n) }).textContent;
  return questions.find((q) => q.question === text)!;
}

function choiceInputs() {
  return [...screen.queryAllByRole('radio'), ...screen.queryAllByRole('checkbox')];
}

function choiceInput(text: string) {
  const found = choiceInputs().find((el) =>
    Array.from(el.closest('label')?.querySelectorAll('span') ?? []).some((s) => s.textContent === text),
  );
  if (!found) throw new Error(`選択肢が見つかりません: ${text}`);
  return found;
}

beforeEach(() => {
  mockParams = new URLSearchParams();
  window.localStorage.clear();
  window.scrollTo = jest.fn();
});

describe('ExamClient', () => {
  it('練習モードで正解すると解説が出て、最後に結果と記録が残る', () => {
    render(<ExamClient set={set} questions={questions} />);
    fireEvent.click(screen.getByRole('radio', { name: '5問' }));
    fireEvent.click(screen.getByRole('button', { name: '5問をはじめる' }));

    for (let i = 0; i < 5; i++) {
      const q = currentQuestion();
      for (const a of q.answer) fireEvent.click(choiceInput(q.choices[a]));
      fireEvent.click(screen.getByRole('button', { name: '解答する' }));
      expect(screen.getByText('正解です')).toBeInTheDocument();
      expect(screen.getByText(q.explanation)).toBeInTheDocument();
      fireEvent.click(screen.getByRole('button', { name: i < 4 ? '次の問題へ' : '結果を見る' }));
    }

    expect(screen.getByRole('img', { name: '正答率 100%' })).toBeInTheDocument();
    expect(screen.getByText('合格の目安（正答率 70%）に達しました。')).toBeInTheDocument();

    const p = loadProgress();
    expect(Object.keys(p.questions)).toHaveLength(5);
    expect(p.sessions[0]).toMatchObject({ examId: 'claude-api', mode: 'practice', total: 5, correct: 5 });
  });

  it('間違えた問題は苦手克服モードで出題できる', () => {
    render(<ExamClient set={set} questions={questions} />);
    fireEvent.click(screen.getByRole('radio', { name: '5問' }));
    fireEvent.click(screen.getByRole('button', { name: '5問をはじめる' }));

    const q = currentQuestion();
    const wrong = q.choices.findIndex((_, i) => !q.answer.includes(i));
    fireEvent.click(choiceInput(q.choices[wrong]));
    fireEvent.click(screen.getByRole('button', { name: '解答する' }));
    expect(screen.getByText('不正解です')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: '中断' }));
    fireEvent.click(screen.getByRole('button', { name: '中断する' }));

    const review = screen.getByRole('radio', { name: /苦手克服/ });
    expect(review).toBeEnabled();
    fireEvent.click(review);
    fireEvent.click(screen.getByRole('button', { name: '1問をはじめる' }));
    expect(currentQuestion().id).toBe(q.id);
  });

  it('選択肢にフォーカスがあっても、数字キーで選んで Enter で解答できる', () => {
    render(<ExamClient set={set} questions={questions} />);
    fireEvent.click(screen.getByRole('radio', { name: '5問' }));
    fireEvent.click(screen.getByRole('button', { name: '5問をはじめる' }));

    const [first] = choiceInputs();
    first.focus();
    fireEvent.keyDown(first, { key: '1' });
    expect(first).toBeChecked();
    fireEvent.keyDown(first, { key: 'Enter' });
    expect(screen.getByRole('status')).toHaveTextContent(currentQuestion().explanation);
  });

  it('URL の ?domain= で分野を選んだ状態から始められる', () => {
    mockParams = new URLSearchParams('domain=tools,unknown');
    render(<ExamClient set={set} questions={questions} />);
    expect(screen.getByRole('checkbox', { name: /ツール利用/ })).toBeChecked();
    expect(screen.getByRole('checkbox', { name: /Messages API の基本/ })).not.toBeChecked();
    fireEvent.click(screen.getByRole('button', { name: '3問をはじめる' }));
    expect(currentQuestion().domain).toBe('tools');
  });

  it('模試モードは時間切れで自動採点される', () => {
    jest.useFakeTimers();
    try {
      render(<ExamClient set={set} questions={questions} />);
      fireEvent.click(screen.getByRole('radio', { name: /模試/ }));
      fireEvent.click(screen.getByRole('radio', { name: '5問' }));
      expect(screen.getByText('制限時間 10 分')).toBeInTheDocument();
      fireEvent.click(screen.getByRole('button', { name: '5問をはじめる' }));
      expect(screen.queryByRole('button', { name: '解答する' })).not.toBeInTheDocument();

      act(() => {
        jest.advanceTimersByTime(10 * 60 * 1000 + 1000);
      });

      expect(screen.getByText('模試の結果')).toBeInTheDocument();
      expect(within(screen.getByRole('img', { name: /正答率/ })).getByText('0 / 5 問')).toBeInTheDocument();
      expect(window.localStorage.getItem(STORAGE_KEY)).not.toBeNull();
    } finally {
      jest.useRealTimers();
    }
  });
});

describe('domainsFromParams', () => {
  it('問題集にある分野だけを、重複なく取り出す', () => {
    const params = new URLSearchParams('domain=tools,basics&domain=tools&domain=nope');
    expect(domainsFromParams(params, set)).toEqual(['tools', 'basics']);
  });

  it('指定がなければ空', () => {
    expect(domainsFromParams(new URLSearchParams(), set)).toEqual([]);
  });
});
