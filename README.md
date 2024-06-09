# tiny-idp
This is a tiny OpenID Connect ID Provider written in TypeScript without any other 3rd party libraries, only standard libraries.

This idp does not have complete implementation because the aim of this project is lerning how OpenID Connect works.

* Only Authentication Code Flow
* Storing data in-memory (no rdb nor nosql)
* Signing only used RS256
* No some endpoints such as userinfo endpoint

## Articles
* [フルスクラッチして理解するOpenID Connect (1) 認可エンドポイント編](https://www.m3tech.blog/entry/2024/03/05/150000)
* [フルスクラッチして理解するOpenID Connect (2) トークンエンドポイント編](https://www.m3tech.blog/entry/2024/03/07/130000)
* [フルスクラッチして理解するOpenID Connect (3) JWT編](https://www.m3tech.blog/entry/2024/03/12/150204)
* [フルスクラッチして理解するOpenID Connect (4) stateとnonce編](https://www.m3tech.blog/entry/2024/03/25/140000)
* [エムスリーテックブック6 第4章 フルスクラッチして理解する OpenID Connect
](https://techbookfest.org/product/1Awt0K23ct4LJQxFz6mQP1?productVariantID=ixQgNDGyL4gL3DD7CxYviw)
