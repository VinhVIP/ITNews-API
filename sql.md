```sql

CREATE DATABASE itnews
	WITH ENCODING='UTF-8';

CREATE TABLE chucvu (
	id_chucvu serial PRIMARY KEY,
	name varchar(30) UNIQUE
);

INSERT INTO chucvu 
VALUES
(1, 'Admin'),
(2, 'Moder'),
(3, 'User');

-- Tạo bảng Tài khoản --

CREATE TABLE account(
	id_account serial PRIMARY KEY,
	id_chucvu serial NOT NULL,
	account_name varchar(50) UNIQUE,
	real_name varchar(50) NOT NULL,
	email varchar(50),
	password text NOT NULL,
	avatar text NOT NULL default '/public/avatar.png',
	birth date,
	gender smallint default 0,
	company text,
	phone varchar(15),
	create_date date default CURRENT_DATE,
	status smallint default 0,

	FOREIGN KEY (id_chucvu) REFERENCES chucvu(id_chucvu)
);

INSERT INTO account 
(id_chucvu, account_name, real_name, email, password)
VALUES
('admin', 'adminvippro', 'Donal Admin', 'admin.itnews@gmail.com', 'dnvjdnvosnvodnv');


-- Tạo bảng thẻ: TAGS --

CREATE TABLE tags(
	id_tag serial PRIMARY KEY,
	name varchar(30) UNIQUE,
	logo text default '/public/tag_logo.png'
);

INSERT INTO tags (name)
VALUES ('Android'), ('HTML');


-- Tạo bảng bài viết

CREATE TABLE posts(
	id_post serial PRIMARY KEY,
	id_account serial,
	title varchar(100) NOT NULL,
	content text NOT NULL,
	created timestamp without time zone NOT NULL,
	last_modified timestamp without time zone NOT NULL,
	view integer default 0,
	status smallint default 0,
	access smallint default 0,

	FOREIGN KEY (id_account) REFERENCES account (id_account)
);	


-- Gắn thẻ bài viết --

CREATE TABLE post_tag(
	id_post serial,
	id_tag serial,

	PRIMARY KEY (id_post, id_tag),

	FOREIGN KEY (id_post) REFERENCES posts(id_post),
	FOREIGN KEY (id_tag) REFERENCES tags(id_tag)
);


-- Bình luận --

CREATE TABLE comments(
	id_cmt serial PRIMARY KEY,
	id_account serial NOT NULL,
	id_post serial NOT NULL,
	date_time timestamp without time zone default CURRENT_TIMESTAMP NOT NULL,
	id_cmt_parent integer default 0,
	status smallint default 0,

	FOREIGN KEY (id_account) REFERENCES account(id_account),
	FOREIGN KEY (id_post) REFERENCES posts(id_post)
);


-- Vote --

CREATE TABLE vote(
	id_account serial,
	id_post serial,
	type smallint default 0,

	PRIMARY KEY (id_account, id_post),

	FOREIGN KEY (id_account) REFERENCES account(id_account),
	FOREIGN KEY (id_post) REFERENCES posts(id_post)
);


-- Bookmark --

CREATE TABLE bookmark(
	id_account serial,
	id_post serial,

	PRIMARY KEY (id_account, id_post),

	FOREIGN KEY (id_account) REFERENCES account(id_account),
	FOREIGN KEY (id_post) REFERENCES posts(id_post)
);

-- FOLLOW TAGS --
CREATE TABLE follow_tag(
	id_account serial,
	id_tag serial,

	PRIMARY KEY(id_account, id_tag),

	FOREIGN KEY (id_account) REFERENCES account(id_account),
	FOREIGN KEY (id_tag) REFERENCES tags(id_tag)
);


-- FOLLOW Account --
CREATE TABLE follow_account(
	id_account serial,
	id_account_follower serial,

	PRIMARY KEY(id_account, id_account_follower),

	FOREIGN KEY (id_account) REFERENCES account(id_account),
	FOREIGN KEY (id_account_follower) REFERENCES account(id_account)
);

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

```
