import { UserEntity } from "../entity/user.entity";

export class UserInfoDto {
	intra_id: string;
	nickname: string;
	profile_url: string;
	stats: [];
	matching_history: [];
	constructor(user: UserEntity) {
		this.intra_id = user.intra_id;
		this.nickname = user.nickname;
		this.profile_url = user.profile_url;
		// this.stats = user.s
	}
}