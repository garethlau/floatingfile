# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

# [1.5.0](https://github.com/garethlau/floatingfile/compare/v1.4.0...v1.5.0) (2021-07-15)


### Bug Fixes

* **@floatingfile/client:** Incorrect version ([e9026c2](https://github.com/garethlau/floatingfile/commit/e9026c2e558700a067f1ad23c63dfa85748c7556))
* **@floatingfile/client:** Optimisticly remove files ([e11f3cc](https://github.com/garethlau/floatingfile/commit/e11f3ccd68519886365be3e43528a5c2d0f19aaf))
* **@floatingfile/client:** Refetch space on successful connection ([f1cfaf7](https://github.com/garethlau/floatingfile/commit/f1cfaf70660002c8be103dc1d70f767846c52cee))
* **@floatingfile/client:** Styling ([f0cbaf6](https://github.com/garethlau/floatingfile/commit/f0cbaf6bc59697816737c4f9b28a3c22ffa244c5))
* **@floatingfile/server:** Generate signed URL ([ff5be3f](https://github.com/garethlau/floatingfile/commit/ff5be3f800acd1b5f3fccd9b2d84585c4094cbd7))
* Remove key requirement for subscription endpoint ([1ee5359](https://github.com/garethlau/floatingfile/commit/1ee5359b59aa5b128c505bfa16e7a42e1333f66b))
* Version release date ([e26b2e0](https://github.com/garethlau/floatingfile/commit/e26b2e054882ac7f680b8a1b4c826c0b244b74c1))


### Features

* **@floatingfile/client:** Add sidebar to home page ([ee7d345](https://github.com/garethlau/floatingfile/commit/ee7d34510e244678565cd53d3f5dae832bc2c10c))
* **@floatingfile/client:** Update intro message ([acdc3cb](https://github.com/garethlau/floatingfile/commit/acdc3cb26b6bd9142dd17d6dd29e7bc610557752))
* Start of 3.3 README ([d1af8af](https://github.com/garethlau/floatingfile/commit/d1af8af346b42b5d8ff3f338bf8e504ec4f03d3b))
* Version 3.3 changelog ([f6a0e26](https://github.com/garethlau/floatingfile/commit/f6a0e2630dc9ae62b633df617c5d2d558e4ba9ac))


### Performance Improvements

* **@floatingfile/client:** Consolidate and reduce queries ([74a17f9](https://github.com/garethlau/floatingfile/commit/74a17f9dd395937808c5d69abc3f71018aa72570))
* **@floatingfile/client:** Smoothen file enter and exit animations ([c4c3424](https://github.com/garethlau/floatingfile/commit/c4c3424702c383e181a2d0e8b0b70e19bdf8a44c))





# [1.4.0](https://github.com/garethlau/floatingfile-mono/compare/v1.3.1...v1.4.0) (2021-03-10)


### Bug Fixes

* Add background color ([8bef0b3](https://github.com/garethlau/floatingfile-mono/commit/8bef0b3b7dc83566d7bb838db1394afc24232fd5))
* Broadcast correct event ([2def487](https://github.com/garethlau/floatingfile-mono/commit/2def48723bb4486d496df0d67386c7c8f1aa669e))
* Disable loader page from refreshing phrase ([64aa439](https://github.com/garethlau/floatingfile-mono/commit/64aa439686d9af98a4e05da40fbea8a2421cb295))
* Handle invalid image type ([48a7b15](https://github.com/garethlau/floatingfile-mono/commit/48a7b151278a57d1da68ac69dfee145ee2647518))
* Only show helper text if no items ([cd82b26](https://github.com/garethlau/floatingfile-mono/commit/cd82b26499cf4bb6607e8a28837d64e9e671c77c))
* QRCode image path ([2c15aa5](https://github.com/garethlau/floatingfile-mono/commit/2c15aa5836830b962741efe3236a16e9ff46a65a))
* Remove / from API path ([090ac58](https://github.com/garethlau/floatingfile-mono/commit/090ac5807814fd825cde7182284bb7384591f1eb))
* Remove unused code ([cf6d5e0](https://github.com/garethlau/floatingfile-mono/commit/cf6d5e07257fd037dc6d921e023d3bf2e3bcfce0))
* Reset download state ([b866e09](https://github.com/garethlau/floatingfile-mono/commit/b866e09e00c386fb4fcda29cfb90f56b85e24f34))
* Show queue above page component ([ec8d596](https://github.com/garethlau/floatingfile-mono/commit/ec8d596451c0de0db2da0c9337efe7a37740ecc1))
* Use component prop to render page ([1a06315](https://github.com/garethlau/floatingfile-mono/commit/1a06315dbf06e93100f7dfecc7ce5b59d1ca1202))


### Features

* Configure default error handler ([c7ad95b](https://github.com/garethlau/floatingfile-mono/commit/c7ad95ba21842fed3c082d980ada753b638929e9))
* Custom useUploadService hook ([6d66963](https://github.com/garethlau/floatingfile-mono/commit/6d66963d7244dd6e8bba8462735949dbd72c5ca4))
* Display download progress ([846118b](https://github.com/garethlau/floatingfile-mono/commit/846118b29f74f8dd627ee58f9f8e461fce73e62c))
* Display download progress for multifile download ([d7461c1](https://github.com/garethlau/floatingfile-mono/commit/d7461c1ff69afcd6b9e8c3ecf9cdbf05e209e14c))
* Empty history helper text ([0e6e975](https://github.com/garethlau/floatingfile-mono/commit/0e6e975a64c29b7994ea5a77a8420dcf857937a3))
* Ensure space exists ([0340b54](https://github.com/garethlau/floatingfile-mono/commit/0340b5428c240e3fda1215d932ec1eb17e6b334e))
* File preview for images ([33d34aa](https://github.com/garethlau/floatingfile-mono/commit/33d34aa5bb465abc37218a1e4703c8b24ff55fe6))
* Remove dependency on collapsed param ([3845889](https://github.com/garethlau/floatingfile-mono/commit/384588941cf2dfb473a5789177a118477504b38e))
* Use react-router-dom for navigation ([c706701](https://github.com/garethlau/floatingfile-mono/commit/c7067018d10be96aed33321690bf217d488e9f15))


### Performance Improvements

* Reduce image preview size ([1b4afa8](https://github.com/garethlau/floatingfile-mono/commit/1b4afa89faab2992203eece882aa2c0a6be5146b))






## [1.3.1](https://github.com/garethlau/floatingfile-mono/compare/v1.3.0...v1.3.1) (2021-02-21)

**Note:** Version bump only for package floatingfile-mono





# [1.3.0](https://github.com/garethlau/floatingfile-mono/compare/v1.2.0...v1.3.0) (2021-02-21)


### Features

* New common package ([794f628](https://github.com/garethlau/floatingfile-mono/commit/794f6281a0157bff4fa8263d123345d9493d7a65))






# [1.2.0](https://github.com/garethlau/floatingfile-mono/compare/v1.1.2...v1.2.0) (2021-02-21)


### Bug Fixes

* Fix frontend path ([87aa18f](https://github.com/garethlau/floatingfile-mono/commit/87aa18f7730509663662f3596de9d20aa45c2e6a))
* Register Honeybadger API KEY ([3ae85dc](https://github.com/garethlau/floatingfile-mono/commit/3ae85dc436c1f1463864bd4dabd959d908b305b3))
* Show placeholder text ([cce0865](https://github.com/garethlau/floatingfile-mono/commit/cce08656c3039444c1b3bf31c53e7a6983c5b6a1))


### Features

* TypeScript migration ([e937d19](https://github.com/garethlau/floatingfile-mono/commit/e937d1986dec6164a06f20fe47bc1814418712e5))





## [1.1.2](https://github.com/garethlau/floatingfile-mono/compare/v1.1.1...v1.1.2) (2021-02-20)


### Bug Fixes

* Build directory path ([009d373](https://github.com/garethlau/floatingfile-mono/commit/009d37300a3d791223976c8e5b7fb5e819975b77))





## [1.1.1](https://github.com/garethlau/floatingfile-mono/compare/v1.1.0...v1.1.1) (2021-02-19)


### Bug Fixes

* Client application directory path ([545d2cb](https://github.com/garethlau/floatingfile-mono/commit/545d2cbc0f9685d63fc176fe87b4e018516120fb))


### Performance Improvements

* Silent build ([a8244be](https://github.com/garethlau/floatingfile-mono/commit/a8244bebfdbb4eb10e4053335722496c3f49bad5))





# 1.1.0 (2021-02-19)


### Features

* V4 nickname API ([c2cd12e](https://github.com/garethlau/floatingfile-mono/commit/c2cd12e903a074a077cdd5ba33289368bfe105f4))
