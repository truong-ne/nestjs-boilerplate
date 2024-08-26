import { MigrationInterface, QueryRunner } from "typeorm";

export class Base1724687494505 implements MigrationInterface {
    name = 'Base1724687494505'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "sessions" ADD "secretKey" character varying NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "sessions" DROP COLUMN "secretKey"`);
    }

}
