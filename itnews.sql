
-- CREATE DATABASE itnews
-- 	WITH ENCODING='UTF-8';

-- Tạo bảng Chức vụ --

CREATE TABLE role (
	id_role serial PRIMARY KEY,
	name varchar(30) UNIQUE
);

INSERT INTO role 
VALUES
(1, 'Admin'),
(2, 'Moder'),
(3, 'User');


-- Tạo bảng Tài khoản --

CREATE TABLE account(
	id_account serial PRIMARY KEY,
	id_role serial NOT NULL,
	account_name varchar(50) UNIQUE,
	real_name varchar(50) NOT NULL,
	email varchar(50),
	password text NOT NULL,
	avatar text NOT NULL default '/public/avatar.png',
	birth date,
	gender smallint default 0,
	-- gender:
		-- 0: Nam
		-- 1: Nữ
		-- 2: Không rõ
	company text,
	phone varchar(15),
	create_date date default CURRENT_DATE,
	status smallint default 0,
	-- status:
		-- 0: Hoạt động
		-- 1: Khóa có thời hạn
		-- 2: Khóa vĩnh viễn

	FOREIGN KEY (id_role) REFERENCES role(id_role)
);

INSERT INTO account 
(id_account, id_role, account_name, real_name, email, password)
VALUES
(1, 1, 'adminvippro', 'Donal Admin', 'admin.itnews@gmail.com', 'dnvjdnvosnvodnv'),
(2, 3, 'vinh', 'Quang Vinh', 'vinhvip@gmail.com', 'mypasswordshouldbehide'),
(3, 3, 'long', 'Hoàng Long', 'long@gmail.com', 'csacdvdfhthdf');



-- Khóa tài khoản --

CREATE TABLE lock_account(
	id_account_lock serial,
	-- id_account_lock: id người bị khóa
	id_account_boss serial,
	-- id_account_boss: id người ra lệnh khóa
	reason text,
	time_start_lock timestamp without time zone default CURRENT_TIMESTAMP,
	hours_lock smallint,

	PRIMARY KEY (id_account_lock, id_account_boss),

	FOREIGN KEY (id_account_lock) REFERENCES account(id_account),
	FOREIGN KEY (id_account_boss) REFERENCES account(id_account)
);


-- Tạo bảng thẻ: TAGS --

CREATE TABLE tag(
	id_tag serial PRIMARY KEY,
	name varchar(30) UNIQUE,
	logo text default '/public/tag_logo.png'
);

INSERT INTO tag (id_tag, name)
VALUES 
(1, 'Android'), 
(2, 'ReactJS'),
(3, 'HTML');


-- Tạo bảng bài viết --

CREATE TABLE post(
	id_post serial PRIMARY KEY,
	id_account serial,
	title varchar(100) NOT NULL,
	content text NOT NULL,
	created timestamp without time zone default CURRENT_TIMESTAMP,
	last_modified timestamp without time zone default CURRENT_TIMESTAMP,
	view integer default 0,
	status smallint default 0,
	-- status: 
		-- 0: Chờ kiểm duyệt
		-- 1: Đã kiểm duyệt
		-- 2: Spam
	access smallint default 0,
	-- access: 
		-- 0: Nháp
		-- 1: Công khai
		-- 2: Chỉ có link mới xem được

	FOREIGN KEY (id_account) REFERENCES account (id_account)
);	

INSERT INTO post(id_post, id_account, title, content, status, access)
VALUES
(1, 1, 'Chào mừng đến với ITNews', 'Mong các bạn có thể chung sức xây dựng website này', 1, 1);

INSERT INTO post(id_post, id_account, title, content)
VALUES
(2, 2, 'Tìm hiểu về ReactJS', 'Tự học đi nha các bạn :v');



-- Gắn thẻ bài viết --

CREATE TABLE post_tag(
	id_post serial,
	id_tag serial,

	PRIMARY KEY (id_post, id_tag),

	FOREIGN KEY (id_post) REFERENCES post(id_post),
	FOREIGN KEY (id_tag) REFERENCES tag(id_tag)
);

INSERT INTO post_tag (id_post, id_tag)
VALUES
(1, 1),
(1, 2),
(1, 3),
(2, 2);


-- Bình luận --

CREATE TABLE comment(
	id_cmt serial PRIMARY KEY,
	id_account serial NOT NULL,
	id_post serial NOT NULL,
	content text NOT NULL,
	date_time timestamp without time zone default CURRENT_TIMESTAMP NOT NULL,
	id_cmt_parent integer default 0,
	status smallint default 0,
	-- status:
		-- 0: Hiện
		-- 1: Ẩn

	FOREIGN KEY (id_account) REFERENCES account(id_account),
	FOREIGN KEY (id_post) REFERENCES post(id_post)
);

INSERT INTO comment(
	id_cmt, id_account, id_post, content
)
VALUES
(1, 2, 1, 'Admin nói hay quá!'),
(2, 3, 1, 'Admin số 2 thì không ai là số 1');

INSERT INTO comment(
	id_cmt, id_account, id_post, content, id_cmt_parent
)
VALUES
(3, 1, 1, 'Cảm ơn bạn nhé', 1);



-- Vote --

CREATE TABLE vote(
	id_account serial,
	id_post serial,
	type smallint default 0,
	-- type:
		-- 0: upvote
		-- 1: downvote

	PRIMARY KEY (id_account, id_post),

	FOREIGN KEY (id_account) REFERENCES account(id_account),
	FOREIGN KEY (id_post) REFERENCES post(id_post)
);

INSERT INTO vote (id_account, id_post, type)
VALUES 
(2, 1, 0);


-- Bookmark --

CREATE TABLE bookmark(
	id_account serial,
	id_post serial,

	PRIMARY KEY (id_account, id_post),

	FOREIGN KEY (id_account) REFERENCES account(id_account),
	FOREIGN KEY (id_post) REFERENCES post(id_post)
);

INSERT INTO bookmark (id_account, id_post)
VALUES
(2, 1),
(1, 2);


-- FOLLOW TAGS --

CREATE TABLE follow_tag(
	id_account serial,
	id_tag serial,

	PRIMARY KEY(id_account, id_tag),

	FOREIGN KEY (id_account) REFERENCES account(id_account),
	FOREIGN KEY (id_tag) REFERENCES tag(id_tag)
);

INSERT INTO follow_tag (id_account, id_tag)
VALUES
(2, 1),
(2, 2),
(1, 3);


-- FOLLOW Account --

-- following theo dõi follower

CREATE TABLE follow_account(
	id_follower serial,
	id_following serial,

	PRIMARY KEY(id_follower, id_following),

	FOREIGN KEY (id_follower) REFERENCES account(id_account),
	FOREIGN KEY (id_following) REFERENCES account(id_account)
);

INSERT INTO follow_account(id_follower, id_following)
VALUES
(2, 1);


-- Thông báo --

CREATE TABLE notification(
	id_notification serial PRIMARY KEY,
	id_account serial,
	content text NOT NULL,
	link text,
	status smallint default 0,

	FOREIGN KEY (id_account) REFERENCES account(id_account)
);


-- Hình ảnh --

CREATE TABLE image(
	id_image serial PRIMARY KEY,
	id_account serial,
	url text NOT NULL,

	FOREIGN KEY(id_account) REFERENCES account(id_account)
);
