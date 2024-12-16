import { useQuery } from '@tanstack/react-query';

const SEMANTIC_ENDPOINT = 'https://celluloid-semantic.huma-num.fr/';

// Move these to where they're actually needed or consider a different state management solution
const globalConcept = 'concept';
const firstConcept = globalConcept;

interface Concept {
  concept: string;
}

const fetchConcepts = async (): Promise<Concept[]> => {
  const response = await fetch(`${SEMANTIC_ENDPOINT}${firstConcept}`);

  if (!response.ok) {
    throw new Error('Failed to fetch concepts');
  }

  const data = await response.json();

  // Transform the data into the required format
  const concepts: Concept[] = [
    ...data.concept.map((concept: string) => ({ concept })),
    { concept: 'Audience Reception' }
  ];

  return concepts;
};

export const useConceptsQuery = () => {
  return useQuery({
    queryKey: ['concepts', firstConcept],
    queryFn: fetchConcepts,
    staleTime: 5 * 60 * 1000, // Consider data fresh for 5 minutes
  });
};
