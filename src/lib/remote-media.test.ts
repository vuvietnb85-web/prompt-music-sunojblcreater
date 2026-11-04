import assert from "node:assert/strict";
import test from "node:test";
import { isPrivateAddress, mediaKind, pickListenFormat, prepareRemoteUrl, shouldDecode } from "./remote-media.ts";

test("social links are accepted and locked shops are refused", () => {
  const youtube = prepareRemoteUrl("https://www.youtube.com/watch?v=aqz-KE-bpKQ");
  assert.equal(youtube.ok, true);
  assert.equal(shouldDecode("https://youtu.be/aqz-KE-bpKQ"), true);
  assert.equal(shouldDecode("https://www.tiktok.com/@a/video/1"), true);
  assert.equal(shouldDecode("https://www.facebook.com/watch/?v=1"), true);
  const zing = prepareRemoteUrl("https://zingmp3.vn/bai-hat/x");
  assert.equal(zing.ok, false);
  const file = prepareRemoteUrl("https://cdn.example.com/audio/song.mp3");
  assert.equal(file.ok, true);
  if (file.ok) assert.equal(file.label, "song.mp3");
});

test("private and local targets are refused", () => {
  assert.equal(prepareRemoteUrl("http://127.0.0.1/a.mp3").ok, false);
  assert.equal(prepareRemoteUrl("http://192.168.1.5/a.mp3").ok, false);
  assert.equal(prepareRemoteUrl("http://localhost/a.mp3").ok, false);
  assert.equal(isPrivateAddress("10.1.2.3"), true);
  assert.equal(isPrivateAddress("8.8.8.8"), false);
  assert.equal(isPrivateAddress("::1"), true);
});

test("listen format prefers a small audio stream over video or playlists", () => {
  const picked = pickListenFormat([
    { url: "https://cdn.example.com/a.m3u8", protocol: "m3u8", acodec: "aac", abr: 128 },
    { url: "https://cdn.example.com/video.mp4", acodec: "aac", vcodec: "h264", abr: 128, filesize: 40_000_000 },
    { url: "https://cdn.example.com/audio.m4a", acodec: "mp4a", vcodec: "none", abr: 90, filesize: 2_000_000 },
    { url: "https://cdn.example.com/hi.webm", acodec: "opus", vcodec: "none", abr: 160 },
  ]);
  assert.equal(picked?.url, "https://cdn.example.com/audio.m4a");
  assert.equal(picked?.video, false);
});

test("media kind follows the file, not a web page", () => {
  assert.equal(mediaKind("audio/mpeg", "/a"), "audio");
  assert.equal(mediaKind("video/mp4", "/a"), "video");
  assert.equal(mediaKind("text/html", "/a.mp3"), null);
  assert.equal(mediaKind("application/octet-stream", "/a.wav"), "audio");
});
