import { MigrationInterface, QueryRunner } from "typeorm";

export class Base1724776139858 implements MigrationInterface {
    name = 'Base1724776139858'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "sessions" ADD "deletedAt" TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "user_discounts" ADD "deletedAt" TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "discounts" ADD "deletedAt" TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "bills" ADD "deletedAt" TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "address" ADD "deletedAt" TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "users" ADD "deletedAt" TIMESTAMP`);
        await queryRunner.query(`ALTER TYPE "public"."discounts_type_enum" RENAME TO "discounts_type_enum_old"`);
        await queryRunner.query(`CREATE TYPE "public"."discounts_type_enum" AS ENUM('Limit', 'OnlyUser')`);
        await queryRunner.query(`ALTER TABLE "discounts" ALTER COLUMN "type" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "discounts" ALTER COLUMN "type" TYPE "public"."discounts_type_enum" USING "type"::"text"::"public"."discounts_type_enum"`);
        await queryRunner.query(`ALTER TABLE "discounts" ALTER COLUMN "type" SET DEFAULT 'Limit'`);
        await queryRunner.query(`DROP TYPE "public"."discounts_type_enum_old"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."discounts_type_enum_old" AS ENUM('Limit')`);
        await queryRunner.query(`ALTER TABLE "discounts" ALTER COLUMN "type" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "discounts" ALTER COLUMN "type" TYPE "public"."discounts_type_enum_old" USING "type"::"text"::"public"."discounts_type_enum_old"`);
        await queryRunner.query(`ALTER TABLE "discounts" ALTER COLUMN "type" SET DEFAULT 'Limit'`);
        await queryRunner.query(`DROP TYPE "public"."discounts_type_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."discounts_type_enum_old" RENAME TO "discounts_type_enum"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "deletedAt"`);
        await queryRunner.query(`ALTER TABLE "address" DROP COLUMN "deletedAt"`);
        await queryRunner.query(`ALTER TABLE "bills" DROP COLUMN "deletedAt"`);
        await queryRunner.query(`ALTER TABLE "discounts" DROP COLUMN "deletedAt"`);
        await queryRunner.query(`ALTER TABLE "user_discounts" DROP COLUMN "deletedAt"`);
        await queryRunner.query(`ALTER TABLE "sessions" DROP COLUMN "deletedAt"`);
    }

}
