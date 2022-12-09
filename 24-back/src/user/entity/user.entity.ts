import { Column, Entity, PrimaryColumn, PrimaryGeneratedColumn } from "typeorm";

@Entity('User')
export class UserEntity {
	@PrimaryGeneratedColumn('rowid')
	id: number;

	@Column({ default: "" })
	intra_id: string;

	@Column({ unique: true })
	nickname: string;

	@Column({ default: "" })
	email: string;

	@Column({ default: "" })
	profile_url: string;

	@Column({ default: false })
	two_factor_Auth: boolean;

	@Column({ default: 0 })
	score: number;
}