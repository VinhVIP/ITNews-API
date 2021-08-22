Sử dụng hệ cơ sở dữ liệu PostgreSQL

## Cài đặt PostgreSQL

https://openplanning.net/10713/cai-dat-co-so-du-lieu-postgresql-tren-windows

## Tạo database + table

```sql
create database book_db;

create table book (
	id integer primary key,
	name char(30) not null,
	author char(30) not null,
	type char(30) not null
)
```

## Cấu hình project, cài đặt các thư viện

```
npm init
npm install express pg body-parser
npm install --save-dev nodemon
```

## API

Server: https://enigmatic-crag-80119.herokuapp.com/

- Get all books:  `/book`
- Get book by id: `/book/:id`
- Get book contain keyword: `/book?q=ten_keyword`
- Post a book: 	`/book`
- Delete a book: `/book/:id`
- Update a book: `/book/:id`