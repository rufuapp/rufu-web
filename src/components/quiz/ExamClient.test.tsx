import { act, fireEvent, render, screen, within } from '@testing-library/react';
import { ExamClient } from './ExamClient';
import { getExam } from '@/content/exams';
import { questionsForExam } from '@/content/questions';
import { STORAGE_KEY, loadProgress } from '@/lib/quiz/progress';

jest.mock('next/navigation', () => ({
  useSearchParams: () => new URLSearchParams(),
}));

const exam = getExam('claude-api')!;
const questions = questionsForExam('claude-api');

function currentQuestion() {
  const text = screen.getByRole('heading', { level: 2, name: (n) => questions.some((q) => q.question === n) }).textContent;
  return questions.find((q) => q.question === text)!;
}

function choiceButton(label: string) {
  return screen.getAllByRole('button').find((b) => b.getAttribute('aria-pressed') !== null && b.textContent?.includes(label))!;
}

beforeEach(() => {
  window.localStorage.clear();
  window.scrollTo = jest.fn();
});

describe('ExamClient', () => {
  it('練習モードで正解すると解説が出て、最後に結果と記録が残る', () => {
    render(<ExamClient exam={exam} questions={questions} />);
    fireEvent.click(screen.getByRole('button', { name: '5問' }));
    fireEvent.click(screen.getByRole('button', { name: '5問をはじめる' }));

    for (let i = 0; i < 5; i++) {
      const q = currentQuestion();
      for (const a of q.answer) fireEvent.click(choiceButton(q.choices[a]));
      fireEvent.click(screen.getByRole('button', { name: '回答する' }));
      expect(screen.getByText('◯ 正解')).toBeInTheDocument();
      expect(screen.getByText(q.explanation)).toBeInTheDocument();
      fireEvent.click(screen.getByRole('button', { name: i < 4 ? '次の問題 →' : '結果を見る' }));
    }

    expect(screen.getByRole('img', { name: '正答率 100%' })).toBeInTheDocument();
    expect(screen.getByText('合格ライン到達！')).toBeInTheDocument();

    const p = loadProgress();
    expect(Object.keys(p.questions)).toHaveLength(5);
    expect(p.sessions[0]).toMatchObject({ examId: 'claude-api', mode: 'practice', total: 5, correct: 5 });
  });

  it('間違えた問題は苦手克服モードで出題できる', () => {
    render(<ExamClient exam={exam} questions={questions} />);
    fireEvent.click(screen.getByRole('button', { name: '5問' }));
    fireEvent.click(screen.getByRole('button', { name: '5問をはじめる' }));

    const q = currentQuestion();
    const wrong = q.choices.findIndex((_, i) => !q.answer.includes(i));
    fireEvent.click(choiceButton(q.choices[wrong]));
    fireEvent.click(screen.getByRole('button', { name: '回答する' }));
    expect(screen.getByText('✕ 不正解')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: '中断' }));
    fireEvent.click(screen.getByRole('button', { name: '中断する' }));

    const review = screen.getByRole('radio', { name: /苦手克服/ });
    expect(review).toBeEnabled();
    fireEvent.click(review);
    fireEvent.click(screen.getByRole('button', { name: '1問をはじめる' }));
    expect(currentQuestion().id).toBe(q.id);
  });

  it('模試モードは時間切れで自動採点される', () => {
    jest.useFakeTimers();
    try {
      render(<ExamClient exam={exam} questions={questions} />);
      fireEvent.click(screen.getByRole('radio', { name: /模試/ }));
      fireEvent.click(screen.getByRole('button', { name: '5問' }));
      expect(screen.getByText('制限時間 10 分')).toBeInTheDocument();
      fireEvent.click(screen.getByRole('button', { name: '5問をはじめる' }));
      expect(screen.queryByRole('button', { name: '回答する' })).not.toBeInTheDocument();

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
