import { Column, Entity, PrimaryColumn, PrimaryGeneratedColumn } from "typeorm";

@Entity('User')
export class UserEntity {
	@PrimaryGeneratedColumn('rowid')
	id: number;

	@Column()
	intraID: string;

	@Column()
	nickname: string;

	@Column()
	profileURL: string;

	@Column()
	two_factor_Auth: boolean;

	@Column()
	score: number;
}