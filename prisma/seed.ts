import "dotenv/config";
import { PrismaClient, type RoleName } from "@/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { hashPassword } from "../src/lib/auth/password";
import { createQrTokenForProfile } from "../src/lib/auth/qr";
import { SEED_THEMES } from "./seed-data/themes";

// Script autonome (exécuté via tsx, hors application Next.js) : il
// construit son propre client plutôt que d'importer le singleton de
// src/lib/prisma.ts, pour rester indépendant du cycle de vie de
// l'app. Depuis Prisma ORM 7, les variables d'environnement ne sont
// plus chargées automatiquement — d'où l'import "dotenv/config" et
// l'adaptateur explicite (Partie 12 §58).
const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

// Permissions par rôle — reflète Partie 7 §34-36 du cahier des charges.
// Voir src/lib/permissions/index.ts pour la liste canonique des codes.
const MEMBER_PERMISSIONS = [
  "profile.view",
  "letter.view",
  "audio.view",
  "gallery.view",
  "chat.view",
  "chat.send",
  "calendar.view",
  "events.view",
  "games.play",
];

const FAMILY_ADMIN_EXTRA_PERMISSIONS = [
  "profile.edit",
  "theme.view",
  "theme.edit",
  "letter.edit",
  "audio.edit",
  "gallery.upload",
  "gallery.delete",
  "calendar.edit",
  "events.create",
  "events.edit",
];

const ALL_PERMISSION_CODES = [
  "profile.view",
  "profile.edit",
  "theme.view",
  "theme.edit",
  "letter.view",
  "letter.edit",
  "audio.view",
  "audio.edit",
  "gallery.view",
  "gallery.upload",
  "gallery.delete",
  "chat.view",
  "chat.send",
  "calendar.view",
  "calendar.edit",
  "events.view",
  "events.create",
  "events.edit",
  "games.play",
  "qr.create",
  "qr.revoke",
  "qr.manage",
  "users.manage",
  "roles.manage",
  "profiles.create",
  "profiles.delete",
  "security.manage",
  "audit.view",
  "system.manage",
];

const PERMISSION_DESCRIPTIONS: Record<string, string> = {
  "profile.view": "Consulter un profil familial",
  "profile.edit": "Modifier la configuration d'un profil",
  "theme.view": "Consulter le thème d'un profil",
  "theme.edit": "Modifier le thème d'un profil",
  "letter.view": "Lire une lettre personnelle",
  "letter.edit": "Modifier une lettre personnelle",
  "audio.view": "Écouter la musique d'un profil",
  "audio.edit": "Importer/remplacer la musique d'un profil",
  "gallery.view": "Consulter la galerie familiale",
  "gallery.upload": "Ajouter un média à la galerie",
  "gallery.delete": "Supprimer un média de la galerie",
  "chat.view": "Consulter le chat familial",
  "chat.send": "Envoyer un message dans le chat",
  "calendar.view": "Consulter le calendrier familial",
  "calendar.edit": "Modifier le calendrier familial",
  "events.view": "Consulter les événements familiaux",
  "events.create": "Créer un événement familial",
  "events.edit": "Modifier un événement familial",
  "games.play": "Accéder aux mini-jeux",
  "qr.create": "Générer un nouvel accès QR",
  "qr.revoke": "Révoquer un accès QR",
  "qr.manage": "Gérer l'ensemble des accès QR",
  "users.manage": "Gérer les comptes utilisateurs",
  "roles.manage": "Gérer les rôles et permissions",
  "profiles.create": "Créer un nouveau profil",
  "profiles.delete": "Supprimer/désactiver un profil",
  "security.manage": "Gérer les paramètres de sécurité",
  "audit.view": "Consulter le journal d'activité",
  "system.manage": "Gérer les paramètres système",
};

async function seedRolesAndPermissions() {
  const roleNames: RoleName[] = ["MEMBER", "FAMILY_ADMIN", "SUPER_ADMIN"];
  const roles: Record<RoleName, { id: string }> = {} as Record<RoleName, { id: string }>;

  for (const name of roleNames) {
    roles[name] = await prisma.role.upsert({
      where: { name },
      update: {},
      create: { name },
    });
  }

  for (const code of ALL_PERMISSION_CODES) {
    await prisma.permission.upsert({
      where: { code },
      update: { description: PERMISSION_DESCRIPTIONS[code] },
      create: { code, description: PERMISSION_DESCRIPTIONS[code] },
    });
  }

  const grantMap: Record<RoleName, string[]> = {
    MEMBER: MEMBER_PERMISSIONS,
    FAMILY_ADMIN: [...MEMBER_PERMISSIONS, ...FAMILY_ADMIN_EXTRA_PERMISSIONS],
    SUPER_ADMIN: ALL_PERMISSION_CODES,
  };

  for (const roleName of roleNames) {
    const codes = grantMap[roleName];
    for (const code of codes) {
      const permission = await prisma.permission.findUniqueOrThrow({ where: { code } });
      await prisma.rolePermission.upsert({
        where: { roleId_permissionId: { roleId: roles[roleName].id, permissionId: permission.id } },
        update: {},
        create: { roleId: roles[roleName].id, permissionId: permission.id },
      });
    }
  }

  return roles;
}

async function seedThemes() {
  const themesBySlug: Record<string, { id: string }> = {};
  for (const t of SEED_THEMES) {
    themesBySlug[t.slug] = await prisma.theme.upsert({
      where: { slug: t.slug },
      update: { ...t } as any,
      create: { ...t } as any,
    });
  }
  return themesBySlug;
}

type SeedProfileInput = {
  displayName: string;
  slug: string;
  email: string;
  role: RoleName;
  themeSlug?: string;
  letter?: string;
  birthDate?: string; // YYYY-MM-DD
  needsQr: boolean;
};

const SEED_PROFILES: SeedProfileInput[] = [
  {
    displayName: "Ada EFFA NDONG Monseralt Greta",
    slug: "monseralt",
    email: "Monseralt@gmail.com",
    role: "MEMBER",
    themeSlug: "lavender-nature",
    letter: `Maman,

J'aurais aimé que tu sois encore là pour nous accompagner tout au long de notre vie, pour célébrer notre bac avec nous, pour être présente lors des jours les plus importants de notre vie et pouvoir dire, avec fierté : « C'est ma fille. »

Ta bonne humeur, ton cœur humble et ta présence me manquent énormément. Je ne saurais exprimer tout ce que je ressens en quelques mots, car mes pensées sont infinies face à ton départ.

Tu as été bien plus qu'une mère pour nous : tu étais aussi notre amie. Ta complicité avec nous a marqué plus d'une personne. Je me souviens encore du jour où mon professeur t'avait vue avec moi au marché. Il avait été ébahi par notre complicité et avait dit qu'on aurait dit des sœurs, tellement tu avais su nous montrer qu'entre toi et nous, il n'y avait aucune barrière.

Ton éducation et ton amour ont fait de nous des personnes humbles et raisonnables. Je ne saurai jamais comment te remercier pour tout ce que tu as pu faire pour tes enfants.

Mais la mort n'empêche pas l'amour. Tu as su conquérir le cœur de ton entourage et le nôtre par ton grand cœur, ta bonté et ta personnalité.

Tu continueras de vivre à travers nous, à travers nos souvenirs, nos valeurs et tout l'amour que nous porterons toujours pour toi.`,
    needsQr: true,
  },
  {
    displayName: "Effa Ndong Marion",
    slug: "marion",
    email: "Marion@gmail.com",
    role: "MEMBER",
    themeSlug: "starry-butterfly",
    letter: `Je t'aime tellement fort maman, mon amour pour toi va au-delà de la mort.`,
    needsQr: true,
  },
  {
    displayName: "Effa Ndong Elema",
    slug: "elema",
    email: "Elema@gmail.com",
    role: "MEMBER",
    themeSlug: "dark-heart",
    letter: `Maman j'aurais aimé que tu sois encore là, tu ne sais pas à quel point tu me manques, surtout nos parties de jeux et nos moments.

Aujourd'hui je vois l'importance d'avoir une mère dans sa vie.

Je voudrais encore que tu me serres dans tes bras.

J'aimerais encore entendre ta voix, t'entendre crier mon nom.

Maman, en partant de cette façon tu m'as laissée dans la peur et la tristesse.

J'aurais voulu grandir à tes côtés, pleurer de joie dans tes bras, mais la vie a décidé autrement.

Maman, pardon pour les fois où je ne t'ai pas écoutée ou désobéi.

J'aurais aimé que tu sois encore là.`,
    needsQr: true,
  },
  {
    displayName: "EFFA Dessir Martin",
    slug: "martin",
    email: "Martin@gmail.com",
    role: "FAMILY_ADMIN",
    themeSlug: "elegant-geometric",
    needsQr: true,
  },
  {
    displayName: "Terance",
    slug: "terance",
    email: "SuperAdmin@gmail.com",
    role: "SUPER_ADMIN",
    themeSlug: "modern-dark",
    needsQr: false, // Le SUPER_ADMIN se connecte via /super-admin/login, sans collier.
  },
];

async function main() {
  console.log("→ Rôles et permissions...");
  await seedRolesAndPermissions();

  console.log("→ Thèmes (12 thèmes de base)...");
  const themes = await seedThemes();

  console.log("→ Conversation familiale...");
  const familyConversation = await prisma.conversation.upsert({
    where: { id: "00000000-0000-0000-0000-000000000001" },
    update: {},
    create: {
      id: "00000000-0000-0000-0000-000000000001",
      name: "Chat familial",
      type: "FAMILY",
    },
  });

  console.log("→ Comptes, profils, lettres, accès QR...");
  const temporaryPasswordHash = await hashPassword("Temp1234");
  // Mot de passe temporaire de démonstration. Voir Partie 6 §9 : les
  // "1234" du cahier des charges sont volontairement remplacés par un
  // mot de passe temporaire qui respecte la politique minimale du
  // système (8 caractères, lettres + chiffres) — "1234" seul serait de
  // toute façon rejeté par isPasswordStrongEnough() lors du changement
  // obligatoire, autant partir d'une valeur cohérente dès le seed.

  for (const p of SEED_PROFILES) {
    const role = await prisma.role.findUniqueOrThrow({ where: { name: p.role } });

    const user = await prisma.user.upsert({
      where: { email: p.email },
      update: {},
      create: {
        email: p.email,
        passwordHash: temporaryPasswordHash,
        roleId: role.id,
        mustChangePassword: true,
      },
    });

    const profile = await prisma.profile.upsert({
      where: { userId: user.id },
      update: {},
      create: {
        userId: user.id,
        displayName: p.displayName,
        profileSlug: p.slug,
      },
    });

    if (p.themeSlug) {
      const theme = themes[p.themeSlug];
      await prisma.profileSettings.upsert({
        where: { profileId: profile.id },
        update: {},
        create: {
          profileId: profile.id,
          themeId: theme.id,
        },
      });
    }

    if (p.letter) {
      const existing = await prisma.letter.findFirst({ where: { profileId: profile.id } });
      if (!existing) {
        await prisma.letter.create({
          data: {
            profileId: profile.id,
            content: p.letter,
            isCurrent: true,
          },
        });
      }
    }

    if (p.birthDate) {
      await prisma.birthday.upsert({
        where: { profileId: profile.id },
        update: {},
        create: {
          profileId: profile.id,
          name: p.displayName,
          birthDate: new Date(p.birthDate),
        },
      });
    }

    if (p.needsQr) {
      const existingQr = await prisma.qrToken.findFirst({
        where: { profileId: profile.id, status: "ACTIVE" },
      });
      if (!existingQr) {
        const { plainToken } = await createQrTokenForProfile(profile.id, user.id, "QR initial");
        console.log(`  QR (${p.slug}) — token en clair (à conserver hors base) : ${plainToken}`);
      }
    }

    await prisma.conversationMember.upsert({
      where: { conversationId_userId: { conversationId: familyConversation.id, userId: user.id } },
      update: {},
      create: { conversationId: familyConversation.id, userId: user.id },
    });
  }

  console.log("\nSeed terminé.");
  console.log("  Mot de passe temporaire pour tous les comptes : Temp1234");
  console.log("  Chaque compte devra le changer à la première connexion.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });