# Changelog

## [3.7.0](https://github.com/celluloid-camp/celluloid/compare/v3.6.2...v3.7.0) (2026-06-11)

### Features

* enhance video analysis interface with detection editing and improved overlay components ([b5d2dc3](https://github.com/celluloid-camp/celluloid/commit/b5d2dc3d8a18031357b21262aba5ff9b0deadfb3))

## [3.6.2](https://github.com/celluloid-camp/celluloid/compare/v3.6.1...v3.6.2) (2026-06-09)

### Bug Fixes

* update Docker metadata action and improve project component styling ([88e00b1](https://github.com/celluloid-camp/celluloid/commit/88e00b194dccc2ad63de4f3badfa42cfa095fe5f))

## [3.6.1](https://github.com/celluloid-camp/celluloid/compare/v3.6.0...v3.6.1) (2026-06-09)

## [3.6.0](https://github.com/celluloid-camp/celluloid/compare/v3.5.0...v3.6.0) (2026-06-09)

### Features

* add Material UI custom controls to video player ([18c7668](https://github.com/celluloid-camp/celluloid/commit/18c766842effe214b74ec79c50accc5224b40ac8))
* add PeerTube integration and enhance video controls ([2327071](https://github.com/celluloid-camp/celluloid/commit/2327071ba7480a93e8dbc53b596c7cb71853937a))
* add subtitle toggle button to video player ([9b55cbd](https://github.com/celluloid-camp/celluloid/commit/9b55cbd6a2cfd58bcb28c5c1d68181955a2c5b29))
* create custom PeerTube player for react-player ([e608eab](https://github.com/celluloid-camp/celluloid/commit/e608eab962e56f7bba8790394850b20e4151d979))
* enhance annotation overlay hints for contextual annotations ([ccc2b40](https://github.com/celluloid-camp/celluloid/commit/ccc2b4096919e9975031cc8196c74bf759c53d58))
* implement smooth playback time for media current time in annotations ([aca95e3](https://github.com/celluloid-camp/celluloid/commit/aca95e34d581433c6790d310eb28b7dfc7e2ed30))
* implement video object detection component and integrate it into the video screen ([7b12c6e](https://github.com/celluloid-camp/celluloid/commit/7b12c6eefe562d19e6c4dd4fec2a277ece16d7e3))
* improve media playback handling with accurate current time and refined pause logic ([ddd5c02](https://github.com/celluloid-camp/celluloid/commit/ddd5c0255ff4fe500476bba9e355586df099e6bf))
* improve PeerTube player based on BigBlueButton implementation ([b306b13](https://github.com/celluloid-camp/celluloid/commit/b306b13f9ecf5aea865d69af1044842173770fe2))
* integrate media-chrome for enhanced video player controls and add PeerTube support ([b10948a](https://github.com/celluloid-camp/celluloid/commit/b10948a23adad81482a7ea7227f5e2c3e119b728))

### Bug Fixes

* improve regex pattern and add null checks for SDK loading ([f1153be](https://github.com/celluloid-camp/celluloid/commit/f1153bef1322011cd89d8c3df199fe9947ac221f))
* update annotation item and comment item ([a7b531b](https://github.com/celluloid-camp/celluloid/commit/a7b531bd59c4df70569dd2111dd44946e3ee15a8))
* update PeerTube player to use PlayerEntry structure ([29c0b34](https://github.com/celluloid-camp/celluloid/commit/29c0b34171c0becbab87d6e39122c8bf27128556))

## 3.5.0

### &nbsp;&nbsp;&nbsp;Features

- Enhance query client with mutation cache and error handling; update transcript processing to use French captions; add job status query to project router; make captionPath optional in PeerTubeCaption interface &nbsp;-&nbsp; by **Younes** [<samp>(b64e6)</samp>](https://github.com/celluloid-camp/celluloid/commit/b64e6fb)

##### &nbsp;&nbsp;&nbsp;&nbsp;[View changes on GitHub](https://github.com/celluloid-camp/celluloid/compare/v3.4.1...staging)

## 3.4.1

*No significant changes*

##### &nbsp;&nbsp;&nbsp;&nbsp;[View changes on GitHub](https://github.com/celluloid-camp/celluloid/compare/v3.4.0...staging)

## 3.4.0

### &nbsp;&nbsp;&nbsp;Features

- Enhance login and project grid components with session handling and error management &nbsp;-&nbsp; by **Younes** [<samp>(7f78c)</samp>](https://github.com/celluloid-camp/celluloid/commit/7f78ca0)
- Add manual time input fields to duration slider &nbsp;-&nbsp; by **Copilot** and **younes200** in https://github.com/celluloid-camp/celluloid/issues/341 [<samp>(5017e)</samp>](https://github.com/celluloid-camp/celluloid/commit/5017e51)
- Enhance duration slider with manual time input and validation. &nbsp;-&nbsp; by **Younes** [<samp>(c7bf5)</samp>](https://github.com/celluloid-camp/celluloid/commit/c7bf51d)
- Add My Playlists tab to user profile &nbsp;-&nbsp; by **Copilot** and **younes200** in https://github.com/celluloid-camp/celluloid/issues/343 [<samp>(9468f)</samp>](https://github.com/celluloid-camp/celluloid/commit/9468f23)
- Enhance user profile with My Projects and My Playlists tabs &nbsp;-&nbsp; by **Younes** [<samp>(761e6)</samp>](https://github.com/celluloid-camp/celluloid/commit/761e6ed)
- Add create playlist functionality with dialog and translations &nbsp;-&nbsp; by **Younes** [<samp>(916f8)</samp>](https://github.com/celluloid-camp/celluloid/commit/916f879)
- Integrate notifications system &nbsp;-&nbsp; by **Younes** [<samp>(b6fcf)</samp>](https://github.com/celluloid-camp/celluloid/commit/b6fcf49)
- Update environment variables for PostHog and Knock API integration &nbsp;-&nbsp; by **Younes** [<samp>(ddb27)</samp>](https://github.com/celluloid-camp/celluloid/commit/ddb27c3)
- Integrate Resend for email sending and update environment variables &nbsp;-&nbsp; by **Younes** [<samp>(dfe76)</samp>](https://github.com/celluloid-camp/celluloid/commit/dfe761a)

### &nbsp;&nbsp;&nbsp;Bug Fixes

- Fix create project error handling &nbsp;-&nbsp; by **Younes** [<samp>(5e163)</samp>](https://github.com/celluloid-camp/celluloid/commit/5e163c3)
- Update transcript generation messages in English and French locales for clarity &nbsp;-&nbsp; by **Younes** [<samp>(15bcf)</samp>](https://github.com/celluloid-camp/celluloid/commit/15bcfd0)
- Update French translation for video transcript message &nbsp;-&nbsp; by **Younes** [<samp>(7b786)</samp>](https://github.com/celluloid-camp/celluloid/commit/7b786cf)
- Specify that the transcript must be in French in the system prompt &nbsp;-&nbsp; by **Younes** [<samp>(5520d)</samp>](https://github.com/celluloid-camp/celluloid/commit/5520d48)
- Specify that the transcript must be in French in the system prompt &nbsp;-&nbsp; by **Younes** in https://github.com/celluloid-camp/celluloid/issues/370 [<samp>(4c365)</samp>](https://github.com/celluloid-camp/celluloid/commit/4c36566)
- Update release workflow condition to remove push trigger &nbsp;-&nbsp; by **Younes** [<samp>(c2159)</samp>](https://github.com/celluloid-camp/celluloid/commit/c2159f1)

##### &nbsp;&nbsp;&nbsp;&nbsp;[View changes on GitHub](https://github.com/celluloid-camp/celluloid/compare/v3.3.3...staging)

## 3.4.32

*No significant changes*

##### &nbsp;&nbsp;&nbsp;&nbsp;[View changes on GitHub](https://github.com/celluloid-camp/celluloid/compare/v3.4.30...v3.4.31)

## 3.4.31

*No significant changes*

##### &nbsp;&nbsp;&nbsp;&nbsp;[View changes on GitHub](https://github.com/celluloid-camp/celluloid/compare/v3.4.29...v3.4.30)

## 3.4.30

*No significant changes*

##### &nbsp;&nbsp;&nbsp;&nbsp;[View changes on GitHub](https://github.com/celluloid-camp/celluloid/compare/v3.4.28...v3.4.29)

## 3.4.29

*No significant changes*

##### &nbsp;&nbsp;&nbsp;&nbsp;[View changes on GitHub](https://github.com/celluloid-camp/celluloid/compare/v3.4.27...v3.4.28)

## 3.4.28

*No significant changes*

##### &nbsp;&nbsp;&nbsp;&nbsp;[View changes on GitHub](https://github.com/celluloid-camp/celluloid/compare/v3.4.26...v3.4.27)

## 3.4.27

*No significant changes*

##### &nbsp;&nbsp;&nbsp;&nbsp;[View changes on GitHub](https://github.com/celluloid-camp/celluloid/compare/v3.4.25...v3.4.26)

## 3.4.26

*No significant changes*

##### &nbsp;&nbsp;&nbsp;&nbsp;[View changes on GitHub](https://github.com/celluloid-camp/celluloid/compare/v3.4.24...v3.4.25)

## 3.4.25

*No significant changes*

##### &nbsp;&nbsp;&nbsp;&nbsp;[View changes on GitHub](https://github.com/celluloid-camp/celluloid/compare/v3.4.23...v3.4.24)

## 3.4.24

*No significant changes*

##### &nbsp;&nbsp;&nbsp;&nbsp;[View changes on GitHub](https://github.com/celluloid-camp/celluloid/compare/v3.4.22...v3.4.23)

## 3.4.23

*No significant changes*

##### &nbsp;&nbsp;&nbsp;&nbsp;[View changes on GitHub](https://github.com/celluloid-camp/celluloid/compare/v3.4.21...v3.4.22)

## 3.4.22

*No significant changes*

##### &nbsp;&nbsp;&nbsp;&nbsp;[View changes on GitHub](https://github.com/celluloid-camp/celluloid/compare/v3.4.20...v3.4.21)

## 3.4.21

*No significant changes*

##### &nbsp;&nbsp;&nbsp;&nbsp;[View changes on GitHub](https://github.com/celluloid-camp/celluloid/compare/v3.4.19...v3.4.20)

## 3.4.20

*No significant changes*

##### &nbsp;&nbsp;&nbsp;&nbsp;[View changes on GitHub](https://github.com/celluloid-camp/celluloid/compare/v3.4.18...v3.4.19)

## 3.4.19

*No significant changes*

##### &nbsp;&nbsp;&nbsp;&nbsp;[View changes on GitHub](https://github.com/celluloid-camp/celluloid/compare/v3.4.17...v3.4.18)

## 3.4.18

*No significant changes*

##### &nbsp;&nbsp;&nbsp;&nbsp;[View changes on GitHub](https://github.com/celluloid-camp/celluloid/compare/v3.4.16...v3.4.17)

## 3.4.17

*No significant changes*

##### &nbsp;&nbsp;&nbsp;&nbsp;[View changes on GitHub](https://github.com/celluloid-camp/celluloid/compare/v3.4.15...v3.4.16)

## 3.4.16

*No significant changes*

##### &nbsp;&nbsp;&nbsp;&nbsp;[View changes on GitHub](https://github.com/celluloid-camp/celluloid/compare/v3.4.14...v3.4.15)

## 3.4.15

*No significant changes*

##### &nbsp;&nbsp;&nbsp;&nbsp;[View changes on GitHub](https://github.com/celluloid-camp/celluloid/compare/v3.4.13...v3.4.14)

## 3.4.14

*No significant changes*

##### &nbsp;&nbsp;&nbsp;&nbsp;[View changes on GitHub](https://github.com/celluloid-camp/celluloid/compare/v3.4.12...v3.4.13)

## 3.4.13

*No significant changes*

##### &nbsp;&nbsp;&nbsp;&nbsp;[View changes on GitHub](https://github.com/celluloid-camp/celluloid/compare/v3.4.11...v3.4.12)

## 3.4.12

*No significant changes*

##### &nbsp;&nbsp;&nbsp;&nbsp;[View changes on GitHub](https://github.com/celluloid-camp/celluloid/compare/v3.4.10...v3.4.11)

## 3.4.11

*No significant changes*

##### &nbsp;&nbsp;&nbsp;&nbsp;[View changes on GitHub](https://github.com/celluloid-camp/celluloid/compare/v3.4.9...v3.4.10)

## 3.4.10

*No significant changes*

##### &nbsp;&nbsp;&nbsp;&nbsp;[View changes on GitHub](https://github.com/celluloid-camp/celluloid/compare/v3.4.8...v3.4.9)

## 3.4.9

*No significant changes*

##### &nbsp;&nbsp;&nbsp;&nbsp;[View changes on GitHub](https://github.com/celluloid-camp/celluloid/compare/v3.4.7...v3.4.8)

## 3.4.8

*No significant changes*

##### &nbsp;&nbsp;&nbsp;&nbsp;[View changes on GitHub](https://github.com/celluloid-camp/celluloid/compare/v3.4.6...v3.4.7)

## 3.4.7

*No significant changes*

##### &nbsp;&nbsp;&nbsp;&nbsp;[View changes on GitHub](https://github.com/celluloid-camp/celluloid/compare/v3.4.5...v3.4.6)

## 3.4.6

*No significant changes*

##### &nbsp;&nbsp;&nbsp;&nbsp;[View changes on GitHub](https://github.com/celluloid-camp/celluloid/compare/v3.4.4...v3.4.5)

## 3.4.5

*No significant changes*

##### &nbsp;&nbsp;&nbsp;&nbsp;[View changes on GitHub](https://github.com/celluloid-camp/celluloid/compare/v3.4.3...v3.4.4)

## 3.4.4

*No significant changes*

##### &nbsp;&nbsp;&nbsp;&nbsp;[View changes on GitHub](https://github.com/celluloid-camp/celluloid/compare/v3.4.2...v3.4.3)

## 3.4.3

*No significant changes*

##### &nbsp;&nbsp;&nbsp;&nbsp;[View changes on GitHub](https://github.com/celluloid-camp/celluloid/compare/v3.4.1...v3.4.2)

## 3.4.2

*No significant changes*

##### &nbsp;&nbsp;&nbsp;&nbsp;[View changes on GitHub](https://github.com/celluloid-camp/celluloid/compare/v3.4.0...v3.4.1)

## 3.4.1

### &nbsp;&nbsp;&nbsp;Features

- Enhance login and project grid components with session handling and error management &nbsp;-&nbsp; by **Younes** [<samp>(7f78c)</samp>](https://github.com/celluloid-camp/celluloid/commit/7f78ca0)
- Add manual time input fields to duration slider &nbsp;-&nbsp; by **Copilot** and **younes200** in https://github.com/celluloid-camp/celluloid/issues/341 [<samp>(5017e)</samp>](https://github.com/celluloid-camp/celluloid/commit/5017e51)
- Enhance duration slider with manual time input and validation. &nbsp;-&nbsp; by **Younes** [<samp>(c7bf5)</samp>](https://github.com/celluloid-camp/celluloid/commit/c7bf51d)
- Add My Playlists tab to user profile &nbsp;-&nbsp; by **Copilot** and **younes200** in https://github.com/celluloid-camp/celluloid/issues/343 [<samp>(9468f)</samp>](https://github.com/celluloid-camp/celluloid/commit/9468f23)
- Enhance user profile with My Projects and My Playlists tabs &nbsp;-&nbsp; by **Younes** [<samp>(761e6)</samp>](https://github.com/celluloid-camp/celluloid/commit/761e6ed)
- Add create playlist functionality with dialog and translations &nbsp;-&nbsp; by **Younes** [<samp>(916f8)</samp>](https://github.com/celluloid-camp/celluloid/commit/916f879)
- Integrate notifications system &nbsp;-&nbsp; by **Younes** [<samp>(b6fcf)</samp>](https://github.com/celluloid-camp/celluloid/commit/b6fcf49)
- Update environment variables for PostHog and Knock API integration &nbsp;-&nbsp; by **Younes** [<samp>(ddb27)</samp>](https://github.com/celluloid-camp/celluloid/commit/ddb27c3)
- Integrate Resend for email sending and update environment variables &nbsp;-&nbsp; by **Younes** [<samp>(dfe76)</samp>](https://github.com/celluloid-camp/celluloid/commit/dfe761a)

### &nbsp;&nbsp;&nbsp;Bug Fixes

- Fix create project error handling &nbsp;-&nbsp; by **Younes** [<samp>(5e163)</samp>](https://github.com/celluloid-camp/celluloid/commit/5e163c3)
- Update transcript generation messages in English and French locales for clarity &nbsp;-&nbsp; by **Younes** [<samp>(15bcf)</samp>](https://github.com/celluloid-camp/celluloid/commit/15bcfd0)
- Update French translation for video transcript message &nbsp;-&nbsp; by **Younes** [<samp>(7b786)</samp>](https://github.com/celluloid-camp/celluloid/commit/7b786cf)
- Specify that the transcript must be in French in the system prompt &nbsp;-&nbsp; by **Younes** [<samp>(5520d)</samp>](https://github.com/celluloid-camp/celluloid/commit/5520d48)
- Specify that the transcript must be in French in the system prompt &nbsp;-&nbsp; by **Younes** in https://github.com/celluloid-camp/celluloid/issues/370 [<samp>(4c365)</samp>](https://github.com/celluloid-camp/celluloid/commit/4c36566)

##### &nbsp;&nbsp;&nbsp;&nbsp;[View changes on GitHub](https://github.com/celluloid-camp/celluloid/compare/v3.3.3...v3.4.0)

## 3.4.0

### &nbsp;&nbsp;&nbsp;Features

- Enhance login and project grid components with session handling and error management &nbsp;-&nbsp; by **Younes** [<samp>(7f78c)</samp>](https://github.com/celluloid-camp/celluloid/commit/7f78ca0)
- Add manual time input fields to duration slider &nbsp;-&nbsp; by **Copilot** and **younes200** in https://github.com/celluloid-camp/celluloid/issues/341 [<samp>(5017e)</samp>](https://github.com/celluloid-camp/celluloid/commit/5017e51)
- Enhance duration slider with manual time input and validation. &nbsp;-&nbsp; by **Younes** [<samp>(c7bf5)</samp>](https://github.com/celluloid-camp/celluloid/commit/c7bf51d)
- Add My Playlists tab to user profile &nbsp;-&nbsp; by **Copilot** and **younes200** in https://github.com/celluloid-camp/celluloid/issues/343 [<samp>(9468f)</samp>](https://github.com/celluloid-camp/celluloid/commit/9468f23)
- Enhance user profile with My Projects and My Playlists tabs &nbsp;-&nbsp; by **Younes** [<samp>(761e6)</samp>](https://github.com/celluloid-camp/celluloid/commit/761e6ed)
- Add create playlist functionality with dialog and translations &nbsp;-&nbsp; by **Younes** [<samp>(916f8)</samp>](https://github.com/celluloid-camp/celluloid/commit/916f879)
- Integrate notifications system &nbsp;-&nbsp; by **Younes** [<samp>(b6fcf)</samp>](https://github.com/celluloid-camp/celluloid/commit/b6fcf49)
- Update environment variables for PostHog and Knock API integration &nbsp;-&nbsp; by **Younes** [<samp>(ddb27)</samp>](https://github.com/celluloid-camp/celluloid/commit/ddb27c3)
- Integrate Resend for email sending and update environment variables &nbsp;-&nbsp; by **Younes** [<samp>(dfe76)</samp>](https://github.com/celluloid-camp/celluloid/commit/dfe761a)

### &nbsp;&nbsp;&nbsp;Bug Fixes

- Fix create project error handling &nbsp;-&nbsp; by **Younes** [<samp>(5e163)</samp>](https://github.com/celluloid-camp/celluloid/commit/5e163c3)
- Update transcript generation messages in English and French locales for clarity &nbsp;-&nbsp; by **Younes** [<samp>(15bcf)</samp>](https://github.com/celluloid-camp/celluloid/commit/15bcfd0)
- Update French translation for video transcript message &nbsp;-&nbsp; by **Younes** [<samp>(7b786)</samp>](https://github.com/celluloid-camp/celluloid/commit/7b786cf)
- Specify that the transcript must be in French in the system prompt &nbsp;-&nbsp; by **Younes** [<samp>(5520d)</samp>](https://github.com/celluloid-camp/celluloid/commit/5520d48)
- Specify that the transcript must be in French in the system prompt &nbsp;-&nbsp; by **Younes** in https://github.com/celluloid-camp/celluloid/issues/370 [<samp>(4c365)</samp>](https://github.com/celluloid-camp/celluloid/commit/4c36566)

##### &nbsp;&nbsp;&nbsp;&nbsp;[View changes on GitHub](https://github.com/celluloid-camp/celluloid/compare/v3.3.3...staging)

## 3.3.3

*No significant changes*

##### &nbsp;&nbsp;&nbsp;&nbsp;[View changes on GitHub](https://github.com/celluloid-camp/celluloid/compare/v3.3.2...3.3.3)

## 3.3.2

### &nbsp;&nbsp;&nbsp;Bug Fixes

- Fix create project error handling &nbsp;-&nbsp; by **Younes** in https://github.com/celluloid-camp/celluloid/issues/334 [<samp>(e7f58)</samp>](https://github.com/celluloid-camp/celluloid/commit/e7f582a)

##### &nbsp;&nbsp;&nbsp;&nbsp;[View changes on GitHub](https://github.com/celluloid-camp/celluloid/compare/v3.3.1...3.3.2)

## 3.3.1

*No significant changes*

##### &nbsp;&nbsp;&nbsp;&nbsp;[View changes on GitHub](https://github.com/celluloid-camp/celluloid/compare/v3.3.0...3.3.1)

## 3.3.0

### &nbsp;&nbsp;&nbsp;Features

- Add search filter input to users/projects table &nbsp;-&nbsp; by **Achraf** [<samp>(36f33)</samp>](https://github.com/celluloid-camp/celluloid/commit/36f3315)
- Video analysis based on vision.celluloid.me &nbsp;-&nbsp; by **Younes** in https://github.com/celluloid-camp/celluloid/issues/326 [<samp>(7ef38)</samp>](https://github.com/celluloid-camp/celluloid/commit/7ef38e3)
- Add user page and send email on video analysis complete &nbsp;-&nbsp; by **Younes** in https://github.com/celluloid-camp/celluloid/issues/327 [<samp>(59aa1)</samp>](https://github.com/celluloid-camp/celluloid/commit/59aa1eb)
- Add STAGE variable for environment configuration in docker-bake.hcl &nbsp;-&nbsp; by **Younes** [<samp>(e9eed)</samp>](https://github.com/celluloid-camp/celluloid/commit/e9eed2f)
- **README**:
  - Add Erwan Queffelec as initial tech contributor &nbsp;-&nbsp; by **Erwan Queffélec** in https://github.com/celluloid-camp/celluloid/issues/324 [<samp>(0201b)</samp>](https://github.com/celluloid-camp/celluloid/commit/0201bba)
  - Add Erwan Queffelec as initial tech contributor &nbsp;-&nbsp; by **Erwan Queffélec** in https://github.com/celluloid-camp/celluloid/issues/324 [<samp>(a30ac)</samp>](https://github.com/celluloid-camp/celluloid/commit/a30ac95)

### &nbsp;&nbsp;&nbsp;Bug Fixes

- Change context annotation issue &nbsp;-&nbsp; by **Younes** in https://github.com/celluloid-camp/celluloid/issues/321 [<samp>(067d1)</samp>](https://github.com/celluloid-camp/celluloid/commit/067d12d)
- Remove unused title &nbsp;-&nbsp; by **Younes** [<samp>(5a0bd)</samp>](https://github.com/celluloid-camp/celluloid/commit/5a0bd25)
- Allow video analysis read without session &nbsp;-&nbsp; by **Younes** [<samp>(c107e)</samp>](https://github.com/celluloid-camp/celluloid/commit/c107ef1)
- Change context annotation issue &nbsp;-&nbsp; by **Younes** in https://github.com/celluloid-camp/celluloid/issues/321 [<samp>(835ef)</samp>](https://github.com/celluloid-camp/celluloid/commit/835ef87)

##### &nbsp;&nbsp;&nbsp;&nbsp;[View changes on GitHub](https://github.com/celluloid-camp/celluloid/compare/v3.2.0...staging)
