import { and, eq } from "drizzle-orm";
import { db } from "./index";
import { peertubeInstance, user } from "./schema";

const DEFAULT_PEERTUBE_INSTANCES = [
  {
    title: "Public Peertube",
    host: "https://sepiasearch.org",
    thumbnail: "https://sepiasearch.org/theme/framasoft/img/title.svg",
    description: "Public PeerTube meta-search (SepiaSearch).",
    isIndex: true,
  },
  {
    title: "Celluloid",
    host: "https://celluloid.cloud",
    thumbnail:
      "https://celluloid.cloud/lazy-static/avatars/195e16ff-c0c2-4ccd-b3d7-3bfe09c55ffd.jpg",
    description: "Celluloid PeerTube instance.",
    isIndex: false,
  },
  {
    title: "MSH Paris Nord",
    host: "https://video.mshparisnord.fr",
    thumbnail:
      "https://video.mshparisnord.fr/lazy-static/avatars/c17d855c-e600-4c89-865d-89c13bb1d5ca.jpg",
    description: "MSH Paris Nord PeerTube instance.",
    isIndex: false,
  },
] as const;

async function seedPeerTubeInstances() {
  const [adminUser] = await db
    .select({ id: user.id })
    .from(user)
    .where(eq(user.role, "Admin"))
    .limit(1);

  const owner =
    adminUser ?? (await db.select({ id: user.id }).from(user).limit(1))[0];

  if (!owner) {
    console.log("No users found — skipping PeerTube instance seed.");
    return;
  }

  for (const instance of DEFAULT_PEERTUBE_INSTANCES) {
    const [existing] = await db
      .select({ id: peertubeInstance.id })
      .from(peertubeInstance)
      .where(
        and(
          eq(peertubeInstance.userId, owner.id),
          eq(peertubeInstance.host, instance.host),
        ),
      )
      .limit(1);

    if (existing) {
      continue;
    }

    await db.insert(peertubeInstance).values({
      userId: owner.id,
      host: instance.host,
      title: instance.title,
      description: instance.description,
      thumbnail: instance.thumbnail,
      isIndex: instance.isIndex,
      isPublic: true,
    });
  }

  console.log("PeerTube instances seeded.");
}

seedPeerTubeInstances()
  .catch((error) => {
    console.error("Failed to seed PeerTube instances:", error);
    process.exit(1);
  })
  .finally(() => {
    process.exit(0);
  });
