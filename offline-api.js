/*
 * 离线版 API 替身（Leaderboard shim）
 * ------------------------------------------------------------------
 * 原版游戏在提交/读取排行榜时会请求：
 *   GET  /api/leaderboard?limit=50   ->  { entries: [{ nickname, v0, stopTime, score }] }
 *   POST /api/score {nickname,v0,stopTime} -> { score, best, rank }
 * 离线环境没有后端，这里把这两个接口用 localStorage 在本地实现，
 * 评分公式与原版前端保持一致： score = round(v0^2 / stopTime)
 * 其余请求一律交还给原生 fetch（离线时通常不会发生）。
 */
(function () {
  'use strict';

  var STORE_KEY = 'brake.offline.leaderboard.v1';
  var LIMIT_MAX = 50;
  var NICK_MAX = 12;

  function computeScore(v0, stopTime) {
    return stopTime > 0 ? Math.round((v0 * v0) / stopTime) : 0;
  }

  // localStorage 在某些环境（隐私模式等）会抛异常，这里退化到内存存储。
  var memoryFallback = [];

  function loadEntries() {
    try {
      var raw = window.localStorage.getItem(STORE_KEY);
      if (!raw) return [];
      var parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      return memoryFallback.slice();
    }
  }

  function saveEntries(list) {
    memoryFallback = list.slice();
    try {
      window.localStorage.setItem(STORE_KEY, JSON.stringify(list));
    } catch (e) {
      /* 存储不可用时仅保留内存副本 */
    }
  }

  function byScoreDesc(a, b) {
    if (b.score !== a.score) return b.score - a.score;
    return a.stopTime - b.stopTime;
  }

  function jsonResponse(payload, status) {
    return Promise.resolve(
      new Response(JSON.stringify(payload), {
        status: status || 200,
        headers: { 'content-type': 'application/json; charset=utf-8' }
      })
    );
  }

  function readJsonBody(init) {
    try {
      if (!init || !init.body) return {};
      if (typeof init.body === 'string') return JSON.parse(init.body) || {};
      return {};
    } catch (e) {
      return {};
    }
  }

  function pathOf(input) {
    var url = typeof input === 'string' ? input : (input && input.url) || '';
    return url.replace(/^[a-z]+:\/\/[^/]+/i, '').split('#')[0];
  }

  var nativeFetch = typeof window.fetch === 'function' ? window.fetch.bind(window) : null;

  window.fetch = function (input, init) {
    var path = pathOf(input);

    if (path.indexOf('/api/leaderboard') === 0) {
      var m = /[?&]limit=(\d+)/.exec(path);
      var limit = m ? Math.min(parseInt(m[1], 10) || LIMIT_MAX, LIMIT_MAX) : LIMIT_MAX;
      var ranked = loadEntries().sort(byScoreDesc).slice(0, limit);
      return jsonResponse({ entries: ranked });
    }

    if (path.indexOf('/api/score') === 0) {
      var body = readJsonBody(init);
      var nickname = String(body.nickname == null ? '' : body.nickname).trim().slice(0, NICK_MAX);
      var v0 = Number(body.v0);
      var stopTime = Number(body.stopTime);

      if (!nickname) return jsonResponse({ error: '请先输入昵称' }, 400);
      if (!isFinite(v0) || !isFinite(stopTime) || stopTime <= 0) {
        return jsonResponse({ error: '成绩无效，请重新挑战' }, 400);
      }

      var score = computeScore(v0, stopTime);
      var list = loadEntries();
      var mine = null;
      for (var i = 0; i < list.length; i++) {
        if (list[i] && list[i].nickname === nickname) {
          mine = list[i];
          break;
        }
      }
      if (mine) {
        if (score > mine.score) {
          mine.v0 = v0;
          mine.stopTime = stopTime;
          mine.score = score;
        }
      } else {
        mine = { nickname: nickname, v0: v0, stopTime: stopTime, score: score };
        list.push(mine);
      }
      saveEntries(list);

      var ordered = list.slice().sort(byScoreDesc);
      var rank = 1;
      for (var j = 0; j < ordered.length; j++) {
        if (ordered[j].nickname === nickname) {
          rank = j + 1;
          break;
        }
      }
      return jsonResponse({ score: score, best: mine.score, rank: rank });
    }

    if (nativeFetch) return nativeFetch(input, init);
    return Promise.reject(new Error('离线版：没有可用的网络请求后端'));
  };
})();
