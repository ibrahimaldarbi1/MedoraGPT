import { Course, MaterialStatus } from "./types";

export const MOCK_COURSES: Course[] = [
  {
    id: 'c1',
    name: 'Human Anatomy 101',
    instructor: 'Dr. Smith',
    examDate: '2023-12-15',
    color: 'bg-indigo-500',
    materials: [
      {
        id: 'm1',
        title: 'Lecture 1: The Skeletal System',
        dateAdded: '2023-10-01',
        status: MaterialStatus.READY,
        topics: ['Axial Skeleton', 'Appendicular Skeleton', 'Bone Composition'],
        weakTopics: ['Bone Composition'],
        summary: `
# The Skeletal System

The skeletal system forms the framework of the body, consisting of bones and other connective tissues.

## Key Functions
*   **Support**: Provides structural support for the entire body.
*   **Protection**: Protects vital organs (e.g., skull protects brain).
*   **Movement**: Levers for muscle action.
*   **Storage**: Calcium and phosphorus storage.
*   **Blood Cell Production**: Hematopoiesis occurs in red marrow.

## Axial vs. Appendicular
1.  **Axial**: Skull, vertebral column, rib cage.
2.  **Appendicular**: Limbs and girdles.
        `,
        flashcards: [
          { id: 'f1', front: 'What are the two main divisions of the skeletal system?', back: 'Axial and Appendicular', difficulty: 'review', nextReview: '2023-10-28' },
          { id: 'f2', front: 'Where does hematopoiesis occur?', back: 'Red bone marrow', difficulty: 'learning', nextReview: '2023-10-27' },
        ],
        mcqs: [
          {
            id: 'q1',
            question: 'Which of the following is NOT a function of the skeletal system?',
            options: ['Protection', 'Hormone production', 'Support', 'Blood cell formation'],
            correctIndex: 1,
            explanation: 'While bones produce blood cells and store minerals, they do not primarily produce hormones (though osteocalcin is a minor exception, general function lists exclude it).'
          }
        ]
      },
      {
        id: 'm2',
        title: 'Lecture 2: Muscular System Intro',
        dateAdded: '2023-10-05',
        status: MaterialStatus.PROCESSING,
        summary: '',
        flashcards: [],
        mcqs: [],
        topics: [],
        weakTopics: []
      }
    ]
  },
  {
    id: 'c2',
    name: 'Organic Chemistry',
    instructor: 'Prof. Al-Fayed',
    examDate: '2023-11-20',
    color: 'bg-emerald-500',
    materials: []
  }
];

export const SAMPLE_TEXT = `
The cardiovascular system, also known as the circulatory system, is an organ system that permits blood to circulate and transport nutrients (such as amino acids and electrolytes), oxygen, carbon dioxide, hormones, and blood cells to and from the cells in the body to provide nourishment and help in fighting diseases, stabilize temperature and pH, and maintain homeostasis.
The essential components of the human cardiovascular system are the heart, blood, and blood vessels. It includes the pulmonary circulation, a "loop" through the lungs where blood is oxygenated; and the systemic circulation, a "loop" through the rest of the body to provide oxygenated blood.
The heart is a muscular organ that pumps blood through the blood vessels of the circulatory system. The pumped blood carries oxygen and nutrients to the body, while carrying metabolic waste such as carbon dioxide to the lungs.
`;
