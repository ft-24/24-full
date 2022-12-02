import { Column, Entity, PrimaryColumn, PrimaryGeneratedColumn } from "typeorm";

@Entity('ChatRoom')
export class ChatRoomEntity {
	@PrimaryGeneratedColumn('rowid')
	id: number;

	@Column()
	owner_id: number;

	@Column({ unique: true })
	name: string;

	@Column()
	access_modifier: string;

	@Column({ nullable: true })
	password: string;

	@Column()
	create_date: Date;

	@Column()
	update_date: Date;
};