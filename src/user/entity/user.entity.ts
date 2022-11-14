import { Column, Entity, PrimaryColumn, PrimaryGeneratedColumn } from "typeorm";

@Entity('User')
export class UserEntity {
	@PrimaryGeneratedColumn('rowid')
	id: number;

	@Column()
	intra_id: string;

	@Column()
	nickname: string;

	@Column()
	profile_url: string;

	@Column()
	two_factor_auth: boolean;

	@Column()
	score: number;
}