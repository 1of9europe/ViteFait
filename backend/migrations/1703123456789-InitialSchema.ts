import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialSchema1703123456789 implements MigrationInterface {
    name = 'InitialSchema1703123456789'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Création de la table users
        await queryRunner.query(`
            CREATE TABLE "users" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "email" character varying NOT NULL,
                "password" character varying NOT NULL,
                "firstName" character varying NOT NULL,
                "lastName" character varying NOT NULL,
                "phone" character varying NOT NULL,
                "role" character varying NOT NULL DEFAULT 'CLIENT',
                "status" character varying NOT NULL DEFAULT 'ACTIVE',
                "latitude" double precision NOT NULL,
                "longitude" double precision NOT NULL,
                "address" character varying NOT NULL,
                "city" character varying NOT NULL,
                "postalCode" character varying NOT NULL,
                "profilePicture" character varying,
                "bio" text,
                "rating" double precision NOT NULL DEFAULT '0',
                "reviewCount" integer NOT NULL DEFAULT '0',
                "isVerified" boolean NOT NULL DEFAULT false,
                "stripeCustomerId" character varying,
                "stripeConnectAccountId" character varying,
                "fcmToken" character varying,
                "lastSeen" TIMESTAMP NOT NULL DEFAULT now(),
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"),
                CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id")
            )
        `);

        // Création de la table missions
        await queryRunner.query(`
            CREATE TABLE "missions" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "title" character varying NOT NULL,
                "description" text NOT NULL,
                "category" character varying NOT NULL,
                "latitude" double precision NOT NULL,
                "longitude" double precision NOT NULL,
                "address" character varying NOT NULL,
                "city" character varying NOT NULL,
                "postalCode" character varying NOT NULL,
                "budget" double precision NOT NULL,
                "deadline" TIMESTAMP NOT NULL,
                "status" character varying NOT NULL DEFAULT 'PENDING',
                "priority" character varying NOT NULL DEFAULT 'NORMAL',
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                "clientId" uuid,
                "assistantId" uuid,
                CONSTRAINT "PK_7c62d1fb2a6c8c3c8c3c8c3c8c3" PRIMARY KEY ("id")
            )
        `);

        // Création de la table payments
        await queryRunner.query(`
            CREATE TABLE "payments" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "amount" double precision NOT NULL,
                "currency" character varying NOT NULL DEFAULT 'eur',
                "status" character varying NOT NULL DEFAULT 'PENDING',
                "description" text,
                "stripePaymentIntentId" character varying,
                "stripeChargeId" character varying,
                "failureReason" text,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                "completedAt" TIMESTAMP,
                "cancelledAt" TIMESTAMP,
                "failedAt" TIMESTAMP,
                "missionId" uuid,
                "clientId" uuid,
                "assistantId" uuid,
                CONSTRAINT "PK_7c62d1fb2a6c8c3c8c3c8c3c8c4" PRIMARY KEY ("id")
            )
        `);

        // Création de la table reviews
        await queryRunner.query(`
            CREATE TABLE "reviews" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "rating" integer NOT NULL,
                "comment" text,
                "isPublic" boolean NOT NULL DEFAULT true,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                "missionId" uuid,
                "reviewerId" uuid,
                "reviewedId" uuid,
                CONSTRAINT "PK_7c62d1fb2a6c8c3c8c3c8c3c8c5" PRIMARY KEY ("id")
            )
        `);

        // Création de la table mission_status_history
        await queryRunner.query(`
            CREATE TABLE "mission_status_history" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "status" character varying NOT NULL,
                "comment" text,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "missionId" uuid,
                "userId" uuid,
                CONSTRAINT "PK_7c62d1fb2a6c8c3c8c3c8c3c8c6" PRIMARY KEY ("id")
            )
        `);

        // Ajout des contraintes de clés étrangères
        await queryRunner.query(`
            ALTER TABLE "missions" 
            ADD CONSTRAINT "FK_missions_client" 
            FOREIGN KEY ("clientId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);

        await queryRunner.query(`
            ALTER TABLE "missions" 
            ADD CONSTRAINT "FK_missions_assistant" 
            FOREIGN KEY ("assistantId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION
        `);

        await queryRunner.query(`
            ALTER TABLE "payments" 
            ADD CONSTRAINT "FK_payments_mission" 
            FOREIGN KEY ("missionId") REFERENCES "missions"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);

        await queryRunner.query(`
            ALTER TABLE "payments" 
            ADD CONSTRAINT "FK_payments_client" 
            FOREIGN KEY ("clientId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);

        await queryRunner.query(`
            ALTER TABLE "payments" 
            ADD CONSTRAINT "FK_payments_assistant" 
            FOREIGN KEY ("assistantId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION
        `);

        await queryRunner.query(`
            ALTER TABLE "reviews" 
            ADD CONSTRAINT "FK_reviews_mission" 
            FOREIGN KEY ("missionId") REFERENCES "missions"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);

        await queryRunner.query(`
            ALTER TABLE "reviews" 
            ADD CONSTRAINT "FK_reviews_reviewer" 
            FOREIGN KEY ("reviewerId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);

        await queryRunner.query(`
            ALTER TABLE "reviews" 
            ADD CONSTRAINT "FK_reviews_reviewed" 
            FOREIGN KEY ("reviewedId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);

        await queryRunner.query(`
            ALTER TABLE "mission_status_history" 
            ADD CONSTRAINT "FK_mission_status_history_mission" 
            FOREIGN KEY ("missionId") REFERENCES "missions"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);

        await queryRunner.query(`
            ALTER TABLE "mission_status_history" 
            ADD CONSTRAINT "FK_mission_status_history_user" 
            FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION
        `);

        // Création des index
        await queryRunner.query(`
            CREATE INDEX "IDX_users_email" ON "users" ("email")
        `);

        await queryRunner.query(`
            CREATE INDEX "IDX_missions_status" ON "missions" ("status")
        `);

        await queryRunner.query(`
            CREATE INDEX "IDX_missions_category" ON "missions" ("category")
        `);

        await queryRunner.query(`
            CREATE INDEX "IDX_payments_status" ON "payments" ("status")
        `);

        await queryRunner.query(`
            CREATE INDEX "IDX_reviews_rating" ON "reviews" ("rating")
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Suppression des index
        await queryRunner.query(`DROP INDEX "IDX_reviews_rating"`);
        await queryRunner.query(`DROP INDEX "IDX_payments_status"`);
        await queryRunner.query(`DROP INDEX "IDX_missions_category"`);
        await queryRunner.query(`DROP INDEX "IDX_missions_status"`);
        await queryRunner.query(`DROP INDEX "IDX_users_email"`);

        // Suppression des contraintes de clés étrangères
        await queryRunner.query(`ALTER TABLE "mission_status_history" DROP CONSTRAINT "FK_mission_status_history_user"`);
        await queryRunner.query(`ALTER TABLE "mission_status_history" DROP CONSTRAINT "FK_mission_status_history_mission"`);
        await queryRunner.query(`ALTER TABLE "reviews" DROP CONSTRAINT "FK_reviews_reviewed"`);
        await queryRunner.query(`ALTER TABLE "reviews" DROP CONSTRAINT "FK_reviews_reviewer"`);
        await queryRunner.query(`ALTER TABLE "reviews" DROP CONSTRAINT "FK_reviews_mission"`);
        await queryRunner.query(`ALTER TABLE "payments" DROP CONSTRAINT "FK_payments_assistant"`);
        await queryRunner.query(`ALTER TABLE "payments" DROP CONSTRAINT "FK_payments_client"`);
        await queryRunner.query(`ALTER TABLE "payments" DROP CONSTRAINT "FK_payments_mission"`);
        await queryRunner.query(`ALTER TABLE "missions" DROP CONSTRAINT "FK_missions_assistant"`);
        await queryRunner.query(`ALTER TABLE "missions" DROP CONSTRAINT "FK_missions_client"`);

        // Suppression des tables
        await queryRunner.query(`DROP TABLE "mission_status_history"`);
        await queryRunner.query(`DROP TABLE "reviews"`);
        await queryRunner.query(`DROP TABLE "payments"`);
        await queryRunner.query(`DROP TABLE "missions"`);
        await queryRunner.query(`DROP TABLE "users"`);
    }
} 