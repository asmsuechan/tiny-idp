# tiny-idp
This is a tiny OpenID Connect ID Provider written in TypeScript without any other 3rd party libraries, only standard libraries.

This idp does not have complete implementation because the aim of this project is lerning how OpenID Connect works.

* Only Authentication Code Flow
* Storing data in-memory (no rdb nor nosql)
* Signing only used RS256
* No some endpoints such as userinfo endpoint
