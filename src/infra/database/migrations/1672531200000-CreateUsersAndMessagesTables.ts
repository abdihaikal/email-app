import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateUsersAndMessagesTables1672531200000
  implements MigrationInterface
{
  name = 'CreateUsersAndMessagesTables1672531200000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
    `);

    await queryRunner.query(`
      CREATE TABLE "users" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "email" character varying(255) NOT NULL,
        "first_name" character varying(50) NOT NULL,
        "middle_name" character varying(50),
        "last_name" character varying(50) NOT NULL,
        "location" character varying(100) NOT NULL DEFAULT 'Asia/Jakarta',
        "birthday_date" date,
        "anniversary_date" date,
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "deleted_at" TIMESTAMP WITH TIME ZONE,
        CONSTRAINT "UQ_users_email" UNIQUE ("email"),
        CONSTRAINT "PK_users_id" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_users_filters" ON "users" ("email", "location", "birthday_date", "anniversary_date")
    `);

    await queryRunner.query(`
      CREATE TABLE "messages" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "user_id" uuid NOT NULL,
        "subject" character varying(255) NOT NULL,
        "content" text,
        "schedule_date" date,
        "status" character varying NOT NULL DEFAULT 'pending',
        "last_attempt_at" TIMESTAMP WITH TIME ZONE,
        "retries_attempted" integer NOT NULL DEFAULT 0,
        "type" character varying NOT NULL DEFAULT 'regular',
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "deleted_at" TIMESTAMP WITH TIME ZONE,
        CONSTRAINT "PK_messages_id" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      ALTER TABLE "messages"
      ADD CONSTRAINT "FK_messages_user_id" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "messages" DROP CONSTRAINT "FK_messages_user_id"`,
    );
    await queryRunner.query(`DROP TABLE "messages"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_users_filters"`);
    await queryRunner.query(`DROP TABLE "users"`);
  }
}
