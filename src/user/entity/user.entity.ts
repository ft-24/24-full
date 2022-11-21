import { Column, Entity, PrimaryColumn, PrimaryGeneratedColumn } from "typeorm";

@Entity('User')
export class UserEntity {
	@PrimaryGeneratedColumn('rowid')
	id: number;

	@Column()
	intraID: string;

	@Column({ unique: true })
	nickname: string;

	@Column({ default: "" })
	email: string;

	@Column()
	profileURL: string;

	@Column({ default: false })
	two_factor_Auth: boolean;

	@Column({ default: 0 })
	score: number;
}