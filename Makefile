.PHONY: crawler
crawler:
	go run cmd/crawler/main.go

.PHONY: web
web:
	cd web && npm install && npm run dev

.PHONY: run
run:
	go run .

.PHONY: dev
dev:
	make -j 2 run web
