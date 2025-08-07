import { MigrationInterface, QueryRunner } from "typeorm";

export class AddInitialMeetingToMissions1703123456790 implements MigrationInterface {
    name = 'AddInitialMeetingToMissions1703123456790'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Ajouter la colonne requiresInitialMeeting
        await queryRunner.query(`
            ALTER TABLE "missions" 
            ADD COLUMN "requiresInitialMeeting" boolean NOT NULL DEFAULT false
        `);

        // Ajouter la colonne meetingTimeSlot
        await queryRunner.query(`
            ALTER TABLE "missions" 
            ADD COLUMN "meetingTimeSlot" TIMESTAMP WITH TIME ZONE NULL
        `);

        // Ajouter un index pour optimiser les requêtes sur les missions avec rencontre initiale
        await queryRunner.query(`
            CREATE INDEX "IDX_missions_requires_initial_meeting" 
            ON "missions" ("requiresInitialMeeting")
        `);

        // Ajouter un index pour optimiser les requêtes sur les créneaux de rencontre
        await queryRunner.query(`
            CREATE INDEX "IDX_missions_meeting_time_slot" 
            ON "missions" ("meetingTimeSlot")
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Supprimer les index
        await queryRunner.query(`DROP INDEX "IDX_missions_meeting_time_slot"`);
        await queryRunner.query(`DROP INDEX "IDX_missions_requires_initial_meeting"`);

        // Supprimer les colonnes
        await queryRunner.query(`ALTER TABLE "missions" DROP COLUMN "meetingTimeSlot"`);
        await queryRunner.query(`ALTER TABLE "missions" DROP COLUMN "requiresInitialMeeting"`);
    }
} 