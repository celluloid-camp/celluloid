import { Knex } from "knex";

const records = [
  {
    id: "58d5d8e2-63fd-4f71-993a-642537afe905",
    name: "Français - Lettres",
    featured: true,
  },
  {
    id: "b00273d0-f65e-4115-807b-4d6eff189b43",
    name: "Mathématiques",
    featured: true,
  },
  {
    id: "f908ead8-f15c-4f5f-84c3-4dfb7e31f1d3",
    name: "Histoire",
    featured: true,
  },
  {
    id: "05639d30-37e5-4280-8bcb-092f39c28819",
    name: "Géographie",
    featured: true,
  },
  {
    id: "2dc18987-a44f-4b5f-9c0d-be81042b767b",
    name: "Technologie",
    featured: true,
  },
  {
    id: "c64c3545-096d-4cb6-9df8-4600aac715bc",
    name: "Ëducation civique",
    featured: true,
  },
  {
    id: "553f4da0-5f1d-4ec0-aafb-7dc8adb109e6",
    name: "Sciences Physiques",
    featured: true,
  },
  {
    id: "45cf959a-69c5-451a-b185-ef16f2344d7d",
    name: "Sport",
    featured: true,
  },
  {
    id: "27eba991-e805-4a82-8281-618b1236380d",
    name: "Sciences de la Vie",
    featured: true,
  },
  {
    id: "5a93968a-9047-4d80-a601-539e8393a4cb",
    name: "Langues",
    featured: true,
  },
  {
    id: "67b3121e-6893-4ed3-b2df-5318e9bfda5c",
    name: "Musique",
    featured: true,
  },
  {
    id: "fbd709d6-68ff-4540-800e-8649bec88892",
    name: "Arts",
    featured: true,
  },
  {
    id: "4fa36e4b-b9ea-42ee-8c7a-cf27fa7292eb",
    name: "Economie",
    featured: true,
  },
  {
    id: "fefba9b8-32c4-41a7-a3ec-1d810b42d843",
    name: "Philosophie",
    featured: true,
  },
  {
    id: "e61332fa-44e5-4719-9e8a-3a62848c44dd",
    name: "Projets de recherche",
    featured: true,
  },
];

export async function seed(knex: Knex): Promise<void> {
  await knex.transaction((trx) => {
    return trx("Tag").insert(records).onConflict("id").merge(["name", "featured"])
  });
}
