import React, { useState } from 'react';
import { Award, CheckCircle, ChevronLeft, ChevronRight, Compass } from 'lucide-react';

interface Lesson {
  title: string;
  koreanTitle: string;
  subtitle: string;
  content: string[];
  proTip: string;
}

export const TutorialView: React.FC = () => {
  const [currentLessonIndex, setCurrentLessonIndex] = useState(0);

  const lessons: Lesson[] = [
    {
      title: '1. Liberties & Capturing',
      koreanTitle: '활로와 따냄 (Hwal-ro)',
      subtitle: 'The breathing spaces of Go stones',
      content: [
        'In Baduk, every stone placed on an intersection possesses "liberties" (empty adjacent points directly above, below, left, and right).',
        'Diagonal points do not count as liberties. Connected stones of the same color share their liberties collectively as a single group.',
        'When all liberties of an enemy group are completely surrounded and occupied by opposing stones, that group has zero liberties and is immediately captured and lifted from the board.',
      ],
      proTip: 'A single stone in the open center has 4 liberties; on the side edge it has 3; in the corner it has only 2 liberties.',
    },
    {
      title: '2. The Atari Condition',
      koreanTitle: '단수 (Dan-soo / Atari)',
      subtitle: 'The warning before capture',
      content: [
        'When a stone or group has only ONE liberty remaining, it enters the critical state called "Atari".',
        'If the defending player does not immediately escape by extending or counter-capturing, the attacker can capture the group on the very next stroke.',
        'Beware of "Self-Atari": playing a stone into a position where you reduce your own liberties to one is almost always a fatal blunder.',
      ],
      proTip: 'In GHOST MOVE GO, the AI engine strictly prevents illegal suicide moves and calculates atari escapes automatically.',
    },
    {
      title: '3. Two True Eyes (Immortal Groups)',
      koreanTitle: '두 눈 만들기 (Du-noon / Two Eyes)',
      subtitle: 'Unconditional life on the board',
      content: [
        'Because suicide is strictly illegal, an opponent cannot play into an empty internal space unless that move captures your entire group.',
        'If your group envelops TWO separate, distinct internal empty intersections ("eyes"), the opponent can never play into either one without committing suicide.',
        'A group with two true eyes is permanently alive (immortal) and can never be captured for the rest of the game.',
      ],
      proTip: 'Corners require the fewest stones (around 6 stones) to construct two secure eyes. The center requires double that amount.',
    },
    {
      title: '4. The Sacred Ko Rule',
      koreanTitle: '패의 규칙 (Pae / Ko Rule)',
      subtitle: 'Preventing eternal time loops',
      content: [
        'Ko (meaning "eternity") occurs when Black captures a single White stone, and White could immediately recapture that same Black stone to recreate the identical previous position.',
        'To prevent an infinite loop, the Ko rule forbids immediate recapture.',
        'The player must first play a "Ko Threat" somewhere else on the board. If the opponent answers the threat, the player may return and recapture the Ko.',
      ],
      proTip: 'GHOST MOVE GO highlights active Ko intersections automatically and enforces the single-turn delay.',
    },
    {
      title: '5. Territory & Korean / Japanese Scoring',
      koreanTitle: '집과 계가 (Jib & Gye-ga)',
      subtitle: 'Measuring surrounded domain at game end',
      content: [
        'The game concludes when both players agree the boundaries are settled by passing consecutively (2 consecutive passes).',
        'Scoring is calculated by counting all vacant intersections completely enclosed by your stones (territory), plus the total enemy stones captured.',
        'Because Black plays first and has an initiative advantage, White receives a compensation bonus called "Komi" of 6.5 points (the 0.5 prevents ties).',
      ],
      proTip: 'Corners are Gold, Sides are Silver, and the Center is Grass. Build territory efficiently along the perimeter before fighting in the middle.',
    },
  ];

  const lesson = lessons[currentLessonIndex];

  return (
    <div className="w-full flex flex-col bg-[#191714] border border-[#2e2821] rounded-xl overflow-hidden text-[#f4efe6]">
      {/* Header */}
      <div className="px-4 py-3 bg-[#141210] border-b border-[#29241d] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Compass className="w-4 h-4 text-[#c28e46]" />
          <h3 className="font-bold text-sm text-[#f5ebd9] font-display">Beginner Baduk Training Academy</h3>
        </div>
        <span className="text-xs text-[#8c806f]">
          Lesson {currentLessonIndex + 1} of {lessons.length}
        </span>
      </div>

      {/* Lesson Content */}
      <div className="p-4 flex flex-col space-y-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h4 className="text-base font-bold text-[#e8c894] font-display">{lesson.title}</h4>
            <span className="text-xs text-[#8c806f] font-serif">{lesson.koreanTitle}</span>
          </div>
          <p className="text-xs text-[#a89b88] font-medium">{lesson.subtitle}</p>
        </div>

        <div className="space-y-2 py-1">
          {lesson.content.map((paragraph, i) => (
            <div key={`p-${i}`} className="flex items-start gap-2 text-xs text-[#d6c9b6] leading-relaxed">
              <CheckCircle className="w-3.5 h-3.5 text-[#c28e46] shrink-0 mt-0.5" />
              <span>{paragraph}</span>
            </div>
          ))}
        </div>

        {/* Pro tip box */}
        <div className="p-3 rounded-lg bg-[#241f19] border border-[#3b3226] flex items-start gap-2.5">
          <Award className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <div className="text-xs">
            <span className="font-bold text-amber-300">Baduk Master Proverb: </span>
            <span className="text-[#c7baa7]">{lesson.proTip}</span>
          </div>
        </div>
      </div>

      {/* Navigation Footer */}
      <div className="px-4 py-2.5 bg-[#141210] border-t border-[#29241d] flex items-center justify-between">
        <button
          onClick={() => setCurrentLessonIndex((i) => Math.max(0, i - 1))}
          disabled={currentLessonIndex === 0}
          className="flex items-center gap-1 px-3 py-1 bg-[#221e1a] hover:bg-[#2c2621] disabled:opacity-30 rounded text-xs text-[#d6c9b6] transition-colors cursor-pointer"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
          <span>Previous</span>
        </button>

        {/* Progress Dots */}
        <div className="flex items-center gap-1.5">
          {lessons.map((_, i) => (
            <div
              key={`dot-${i}`}
              onClick={() => setCurrentLessonIndex(i)}
              className={`w-2 h-2 rounded-full cursor-pointer transition-all ${
                i === currentLessonIndex ? 'bg-[#c28e46] scale-125' : 'bg-[#3b342b]'
              }`}
            />
          ))}
        </div>

        <button
          onClick={() => setCurrentLessonIndex((i) => Math.min(lessons.length - 1, i + 1))}
          disabled={currentLessonIndex === lessons.length - 1}
          className="flex items-center gap-1 px-3 py-1 bg-[#c28e46] hover:bg-[#d69f53] text-[#16120c] font-bold disabled:opacity-30 rounded text-xs transition-colors cursor-pointer"
        >
          <span>Next</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
