import { faker } from "@faker-js/faker";

// Generate mock users
const createMockUser = () => {
  const id = faker.string.uuid();

  return {
    id: id,
    name: faker.person.fullName(),
    imageUrl: `https://picsum.photos/seed/${id}/100/100`,
  };
};

export const mockUsers = Array.from({ length: 12 }, () => createMockUser());
