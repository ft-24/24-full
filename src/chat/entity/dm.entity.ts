import { Column, Entity, PrimaryColumn, PrimaryGeneratedColumn } from "typeorm";

@Entity('DM')
export class DMEntity {
	@PrimaryGeneratedColumn('rowid')
	id: number;

	@Column()
	sender: number; // user_id

	@Column()
	receiver: number;

	@Column()
	chat: string;

	@Column()
	time: Date;
};