const roomScene = document.getElementById("room-scene");
const roomGirl = document.getElementById("room-girl");
const roomPhone = document.getElementById("room-phone");
const roomNoti = document.getElementById("room-noti");

const dialogLayer = document.getElementById("dialog-layer");
const callAudio = document.getElementById("call-audio");

let scene = "room"; // room -> chat_q1 -> call -> call_question -> q3 -> win/gameover
let isFinished = false;

// -------- KHỞI ĐỘNG: PHÒNG NGỦ, ĐIỆN THOẠI RUNG --------

function startRoomIntro() {
  // hiện noti + cho nhân vật cầm điện thoại
  roomPhone.classList.remove("hidden");
  roomNoti.classList.remove("hidden");

  setTimeout(() => {
    roomNoti.classList.add("hidden");
    openChatQ1();
  }, 1500);
}

// -------- TẠO NÚT LỰA CHỌN --------

function createChoiceBtn(key, text, handler) {
  const btn = document.createElement("button");
  btn.className = "choice-btn";
  btn.innerHTML = `<span class="key">${key}</span><span>${text}</span>`;
  btn.addEventListener("click", () => {
    if (isFinished) return;
    handler();
  });
  return btn;
}

// -------- CÂU HỎI 1 – UI CHAT MESSENGER --------

function openChatQ1() {
  scene = "chat_q1";
  dialogLayer.classList.remove("hidden");
  dialogLayer.innerHTML = "";

  const layout = document.createElement("div");
  layout.className = "dialog-layout";

  const avatarCol = document.createElement("div");
  avatarCol.className = "dialog-avatar";
  avatarCol.innerHTML = `
    <img class="avatar-circle" src="img/avatar-girl.png" alt="Nhân vật nữ" />
    <div class="avatar-name">Nhân vật nữ · Lớp 12</div>
    <div style="font-size:12px;color:#9ca3af;text-align:center">
      Bạn đang ở trong phòng ngủ, vừa xem lại bảng điểm thì TikTok hiện thông báo tin nhắn mới...
    </div>
  `;

  const phone = document.createElement("div");
  phone.className = "phone-shell";

  phone.innerHTML = `
    <div class="phone-header">
      <img class="phone-header-avatar avatar-crush" src="img/avatar-crush.jpg" alt="Crush Bắc Sơn" />
      <div class="phone-header-info">
        <div class="phone-header-name">Crush Bắc Sơn</div>
        <div class="phone-header-sub">Hoạt động gần đây</div>
      </div>
    </div>
    <div class="phone-body" id="chat-body"></div>
    <div class="phone-footer">
      Câu hỏi 1: Cờ đỏ ngôn từ bạn nhận ra là gì?
    </div>
    <div class="choice-panel" id="chat-q1-choices"></div>
  `;

  const chatBody = phone.querySelector("#chat-body");
  const ting = document.getElementById("ting-audio");

  // 🎵 Hiện tin nhắn đầu tiên
  chatBody.insertAdjacentHTML(
    "beforeend",
    `
      <div class="bubble them">
        Anh thấy em ở trước cổng trường chiều nay. Em xinh quá.<br/>
        Anh biết em đang buồn vì điểm kiểm tra thấp. Anh sẽ giúp em.
      </div>
      <div class="bubble-meta">Đã gửi · 1 phút trước</div>
    `
  );

  // phát âm thanh ting.mp3
  if (ting) {
    ting.currentTime = 0;
    ting.play().catch(() => {});
  }

  // 🕒 Hiệu ứng "đang soạn tin nhắn"
  const typing = document.createElement("div");
  typing.className = "typing-indicator";
  typing.innerHTML = `<span></span><span></span><span></span>`;
  chatBody.appendChild(typing);

  // sau 2s, hiện tin nhắn 2 + ting.mp3 lần nữa
  setTimeout(() => {
    typing.remove();
    chatBody.insertAdjacentHTML(
      "beforeend",
      `
        <div class="bubble them">
          Hãy nhắn riêng với anh, đừng kể với ai nhé.
        </div>
        <div class="bubble-meta">Đã gửi</div>
      `
    );
    if (ting) {
      ting.currentTime = 0;
      ting.play().catch(() => {});
    }
  }, 2000); // đổi số này để chỉnh thời gian trễ

  // các lựa chọn
  const choices = phone.querySelector("#chat-q1-choices");
  choices.appendChild(
    createChoiceBtn(
      "A",
      "Xem đây là người hâm mộ dễ thương, thoải mái nhắn lại và kể chuyện riêng tư.",
      () => {
        showGameOver(
          "Bạn coi nhẹ việc người lạ biết rõ nơi chốn, tâm trạng và khuyến khích giữ bí mật. Đó là bước đầu để cô lập và thao túng bạn."
        );
      }
    )
  );
  choices.appendChild(
    createChoiceBtn(
      "B",
      "Nhận ra người lạ biết quá chi tiết về mình và yêu cầu giữ bí mật → Cờ đỏ thao túng, chặn ngay.",
      () => {
        openCallScene();
      }
    )
  );
  choices.appendChild(
    createChoiceBtn(
      "C",
      "Thấy sợ, không trả lời và quyết định hỏi ý kiến bố mẹ/thầy cô.",
      () => {
        openCallScene();
      }
    )
  );

  layout.appendChild(avatarCol);
  layout.appendChild(phone);
  dialogLayer.appendChild(layout);
}




// -------- UI CUỘC GỌI – NGHE AUDIO --------

function openCallScene() {
  scene = "call";
  dialogLayer.innerHTML = "";

  const layout = document.createElement("div");
  layout.className = "dialog-layout";

  const avatarCol = document.createElement("div");
  avatarCol.className = "dialog-avatar";
  avatarCol.innerHTML = `
    <img class="avatar-circle" src="img/avatar-girl.png" alt="Nhân vật nữ" />
    <div class="avatar-name">Nhân vật nữ · Lớp 12</div>
    <div style="font-size:12px;color:#9ca3af;text-align:center">
      Vài phút sau, một số Zalo lạ gọi video đến điện thoại của bạn...
    </div>
  `;

  const phone = document.createElement("div");
  phone.className = "phone-shell";

  phone.innerHTML = `
    <div class="phone-header">
      <img class="phone-header-avatar avatar-police" src="img/avatar-police.png" alt="Công an mạng" />
      <div class="phone-header-info">
        <div class="phone-header-name">Công an mạng (?)</div>
        <div class="phone-header-sub">Đang gọi...</div>
      </div>
    </div>
    <div class="call-screen">
      <div class="call-main">
        <img class="call-avatar avatar-police" src="img/avatar-police.png" alt="Công an mạng" />
        <div class="call-name">"Công an mạng"</div>
        <div class="call-sub">Số lạ · Không có trong danh bạ</div>
        <div class="call-timer" id="call-timer" style="display:none;">00:00</div>
      </div>
      <div class="call-actions">
        <button class="call-btn decline" id="btn-decline">✕</button>
        <button class="call-btn accept" id="btn-accept">✓</button>
      </div>
    </div>
  `;

  layout.appendChild(avatarCol);
  layout.appendChild(phone);
  dialogLayer.appendChild(layout);

  const btnAccept = phone.querySelector("#btn-accept");
  const btnDecline = phone.querySelector("#btn-decline");
  const ringtone = document.getElementById("ringtone-audio");

  // 🔊 Bắt đầu phát nhạc chuông khi xuất hiện màn hình gọi
  if (ringtone) {
    ringtone.currentTime = 0;
    ringtone.volume = 0.8;
    ringtone.play().catch(() => {});
  }

  // ❌ Từ chối cuộc gọi
  btnDecline.addEventListener("click", () => {
    if (ringtone) {
      ringtone.pause();
      ringtone.currentTime = 0;
    }
    showGameOver(
      "Bạn cúp máy vì sợ nhưng vẫn giữ mọi chuyện cho riêng mình. Để an toàn, cần báo cho người lớn và cơ quan chức năng, không tự ôm nỗi sợ một mình."
    );
  });

  // ✅ Chấp nhận cuộc gọi
  btnAccept.addEventListener("click", () => {
    if (ringtone) {
      ringtone.pause();
      ringtone.currentTime = 0;
    }
    startCallAudio(phone);
  });
}

// ---------- bắt đàu cuộc gọi ----------
function startCallAudio(phoneShell) {
  const acceptBtn = phoneShell.querySelector("#btn-accept");
  const declineBtn = phoneShell.querySelector("#btn-decline");
  const headerSub = phoneShell.querySelector(".phone-header-sub");
  const timerEl = phoneShell.querySelector("#call-timer");

  let seconds = 0;

  // Hiện timer + trạng thái đang gọi
  if (timerEl) {
    timerEl.style.display = "block";
    timerEl.textContent = "00:00";
  }
  if (headerSub) {
    headerSub.textContent = "Đang trong cuộc gọi...";
  }

  // Ẩn nút từ chối ban đầu
  if (declineBtn) {
    declineBtn.style.display = "none";
  }

  // Đổi nút chấp nhận thành nút tắt máy (đỏ ✕)
  if (acceptBtn) {
    acceptBtn.disabled = false;     // đảm bảo không bị disable
    acceptBtn.classList.remove("accept");
    acceptBtn.classList.add("decline");
    acceptBtn.textContent = "✕";
  }

  // Đếm thời gian cuộc gọi
  const timerId = setInterval(() => {
    seconds++;
    if (timerEl) {
      const m = String(Math.floor(seconds / 60)).padStart(2, "0");
      const s = String(seconds % 60).padStart(2, "0");
      timerEl.textContent = `${m}:${s}`;
    }
  }, 1000);

  function endCallAndGoNext() {
    clearInterval(timerId);
    if (callAudio) {
      callAudio.pause();
      callAudio.currentTime = 0;
    }
    openCallQuestion(); // sang Câu hỏi 2
  }

  // Bấm nút ✕ (sau khi nhận) để kết thúc cuộc gọi
  if (acceptBtn) {
    acceptBtn.onclick = endCallAndGoNext; // ghi đè handler cũ
  }

  // Phát audio (nếu có)
  if (callAudio) {
    callAudio.currentTime = 0;
    callAudio.play().catch(() => {
      // nếu bị chặn autoplay: vẫn để người chơi tự bấm ✕
    });

    // Khi audio phát xong thì tự sang câu hỏi
    callAudio.onended = () => {
      endCallAndGoNext();
    };
  }
}



// -------- SAU CUỘC GỌI: CÂU HỎI 2 --------

function openCallQuestion() {
  scene = "call_question";
  dialogLayer.innerHTML = "";

  const card = document.createElement("div");
  card.className = "scene-card";

  card.innerHTML = `
    <div class="scene-tag">Phần 2 · Cuộc gọi mạo danh "công an mạng"</div>
    <div class="scene-title">Đòn tâm lý: dọa bắt và ép chuyển tiền</div>
    <div class="scene-description">
      Trong cuộc gọi, giọng nam nghiêm trọng nói:
      <br/><br/>
      <i>
      "Tôi là công an mạng. Tài khoản của cậu liên quan đến một vụ lừa đảo lớn.
      Tôi đang truy cập vào máy tính cá nhân của cậu. Nếu cậu cúp máy, cậu sẽ bị bắt.
      Cậu phải gửi 200k tiền 'lệ phí xác minh' vào số tài khoản này ngay lập tức để tôi kiểm tra."
      </i>
      <br/><br/>
      Tim bạn đập nhanh, tay hơi run. Bạn chỉ có vài giây để quyết định.
    </div>
    <div class="question">Câu hỏi 2: Bạn nên làm gì để không rơi vào bẫy?</div>
  `;

  const optionsDiv = document.createElement("div");
  optionsDiv.className = "options";

  optionsDiv.appendChild(
    createChoiceBtn("A", "Vội vã chuyển ngay 200k để khỏi bị bắt, tính sau.", () => {
      showGameOver(
        "Bạn đã chủ động chuyển tiền cho kẻ mạo danh công an. Công an thật không làm việc qua Zalo, không dọa bắt và không yêu cầu chuyển 'lệ phí xác minh' vào tài khoản cá nhân."
      );
    })
  );

  optionsDiv.appendChild(
    createChoiceBtn(
      "B",
      "Cúp máy ngay, chặn số, lưu lại bằng chứng rồi báo với phụ huynh/giáo viên.",
      () => {
        openQuestion3();
      }
    )
  );

  optionsDiv.appendChild(
    createChoiceBtn(
      "C",
      "Giữ máy, xin xỏ và cố gắng giải thích để họ 'tha'.",
      () => {
        showGameOver(
          "Càng kéo dài cuộc gọi, bạn càng bị gây áp lực tâm lý, dễ bị dụ cung cấp thêm thông tin cá nhân hoặc chuyển thêm tiền."
        );
      }
    )
  );

  card.appendChild(optionsDiv);
  dialogLayer.appendChild(card);
}


// -------- CÂU HỎI 3 --------

function openQuestion3() {
  scene = "q3";
  dialogLayer.innerHTML = "";

  const card = document.createElement("div");
  card.className = "scene-card";

  card.innerHTML = `
    <div class="scene-tag">Phần 3 · Lựa chọn sống còn</div>
    <div class="scene-title">Tin nhắn đe dọa cuối cùng</div>
    <div class="scene-description">
      Sau khi bạn chặn số lạ, vài phút sau xuất hiện một tin nhắn nặc danh:
    </div>
    <div class="chat-box">
      <div class="chat-label">Tin nhắn nặc danh</div>
      <div>
        "Tao có hết ảnh của mày. 15 phút nữa, đến cổng trường <b>một mình</b>.
        Không đến là tao đăng hết ảnh lên mạng."
      </div>
    </div>
    <div class="question">Câu hỏi 3: Hành động nào giúp bạn còn đường sống an toàn nhất?</div>
  `;

  const optionsDiv = document.createElement("div");
  optionsDiv.className = "options";

  optionsDiv.appendChild(
    createChoiceBtn(
      "A",
      "Lén tới gặp một mình để cầu xin, mong hắn xóa ảnh.",
      () => {
        showGameOver(
          "Đi gặp kẻ xấu một mình là cực kỳ nguy hiểm. Bạn có thể bị tấn công, bắt cóc hoặc tiếp tục bị tống tiền."
        );
      }
    )
  );

  optionsDiv.appendChild(
    createChoiceBtn(
      "B",
      "Ở yên trong nhà/trường, báo ngay cho giáo viên hoặc phụ huynh, sau đó gọi tổng đài 111.",
      () => {
        showWin();
      }
    )
  );

  optionsDiv.appendChild(
    createChoiceBtn(
      "C",
      "Rủ thêm vài đứa bạn thân ra cổng trường đánh hắn cho bõ tức.",
      () => {
        showGameOver(
          "Dùng bạo lực không làm bạn an toàn hơn, mà còn có thể khiến bạn và bạn bè vi phạm pháp luật."
        );
      }
    )
  );

  card.appendChild(optionsDiv);
  dialogLayer.appendChild(card);
}


// -------- GAME OVER & WIN --------

function showGameOver(reasonText) {
  scene = "gameover";
  isFinished = true;
  dialogLayer.innerHTML = "";

  // Tắt mọi âm thanh đang phát (chuông + cuộc gọi)
  const ringtone = document.getElementById("ringtone-audio");
  if (ringtone) {
    ringtone.pause();
    ringtone.currentTime = 0;
  }
  if (callAudio) {
    callAudio.pause();
    callAudio.currentTime = 0;
  }

  const card = document.createElement("div");
  card.className = "scene-card";

  card.innerHTML = `
    <div class="pill-badge pill-danger">
      ⚠️ GAME OVER · Bạn đã rơi vào bẫy
    </div>
    <div class="result-title">Kẻ xấu đã lợi dụng bạn</div>
    <div class="result-sub">
      <b>Sai lầm chính:</b> ${reasonText}
      <br/><br/>
      Bạn xử lý trong trạng thái <b>sợ hãi</b> và gần như <b>một mình</b>,
      đúng với kịch bản kẻ xấu mong muốn: cô lập – gây áp lực – ép làm theo yêu cầu.
    </div>
    <div class="result-sub">
      <b>Bài học:</b>
      <ul style="margin-top:6px;padding-left:18px;list-style:disc;">
        <li>Không chuyển tiền, không gửi thêm ảnh hay thông tin cá nhân.</li>
        <li>Không đi gặp kẻ lạ một mình, dù bị đe dọa thế nào.</li>
        <li>Báo ngay cho người lớn đáng tin cậy và gọi tổng đài <b>111</b> để được hỗ trợ.</li>
      </ul>
    </div>
  `;

  const actions = document.createElement("div");
  actions.className = "action-row";

  const retryBtn = document.createElement("button");
  retryBtn.className = "primary-btn";
  retryBtn.textContent = "Chơi lại từ đầu";
  retryBtn.addEventListener("click", resetGame);

  const tipsBtn = document.createElement("button");
  tipsBtn.className = "ghost-btn";
  tipsBtn.textContent = "Nhắc lại 3 quy tắc vàng";
  tipsBtn.addEventListener("click", () => {
    alert(
      "3 quy tắc vàng:\n\n" +
        "1) Không thỏa hiệp: không chuyển tiền, không gửi thêm ảnh/thông tin.\n" +
        "2) Không hoảng loạn, không đi gặp một mình.\n" +
        "3) Báo ngay cho thầy cô, phụ huynh hoặc gọi 111."
    );
  });

  actions.appendChild(retryBtn);
  actions.appendChild(tipsBtn);
  card.appendChild(actions);

  dialogLayer.appendChild(card);

  // 🔊 Phát nhạc thua
  const loseAudio = document.getElementById("lose-audio");
  if (loseAudio) {
    loseAudio.currentTime = 0;
    loseAudio.volume = 0.9;
    loseAudio.play().catch(() => {});
  }
}


function showWin() {
  scene = "win";
  isFinished = true;
  dialogLayer.innerHTML = "";

  // Tắt mọi âm thanh đang phát (chuông + cuộc gọi)
  const ringtone = document.getElementById("ringtone-audio");
  if (ringtone) {
    ringtone.pause();
    ringtone.currentTime = 0;
  }
  if (callAudio) {
    callAudio.pause();
    callAudio.currentTime = 0;
  }

  const card = document.createElement("div");
  card.className = "scene-card";

  card.innerHTML = `
    <div class="pill-badge pill-success">
      ✅ CHIẾN THẮNG · Bạn đã phá mật mã an toàn
    </div>
    <div class="result-title">Bạn đã thoát hiểm thành công! 🎉</div>
    <div class="result-sub">
      Bạn đã:
      <ul style="margin-top:6px;padding-left:18px;list-style:disc;">
        <li><b>Tỉnh táo</b> nhận ra cờ đỏ từ tài khoản lạ "CrushBắcSơn".</li>
        <li><b>Không chuyển tiền</b> cho kẻ mạo danh "công an mạng".</li>
        <li><b>Không đi gặp một mình</b>, mà chọn ở nơi an toàn và báo cho người lớn/tổng đài 111.</li>
      </ul>
    </div>
    <div class="result-sub">
      <b>Mật mã Bắc Sơn:</b> Không thỏa hiệp – Không hoảng loạn – Không đi một mình.<br/>
      Đó là cách bạn bảo vệ chính mình và giúp bạn bè xung quanh an toàn hơn trên không gian mạng.
    </div>
  `;

  const actions = document.createElement("div");
  actions.className = "action-row";

  const retryBtn = document.createElement("button");
  retryBtn.className = "primary-btn";
  retryBtn.textContent = "Chơi lại để luyện phản xạ";
  retryBtn.addEventListener("click", resetGame);

  const shareBtn = document.createElement("button");
  shareBtn.className = "ghost-btn";
  shareBtn.textContent = "Gợi ý để cả lớp cùng chơi";
  shareBtn.addEventListener("click", () => {
    alert(
      "Gợi ý triển khai:\n\n" +
        "- Cho từng nhóm trong lớp cùng chọn A/B/C.\n" +
        "- Dừng ở mỗi câu để phân tích thêm nguy cơ.\n" +
        "- Sau game, ghi lại \"bộ quy tắc an toàn\" dán trong lớp."
    );
  });

  actions.appendChild(retryBtn);
  actions.appendChild(shareBtn);
  card.appendChild(actions);

  dialogLayer.appendChild(card);

  // 🔊 Phát nhạc thắng
  const winAudio = document.getElementById("win-audio");
  if (winAudio) {
    winAudio.currentTime = 0;
    winAudio.volume = 0.9;
    winAudio.play().catch(() => {});
  }
}


// -------- RESET GAME --------

function resetGame() {
  isFinished = false;
  scene = "room";

  // Ẩn layer câu hỏi
  dialogLayer.classList.add("hidden");
  dialogLayer.innerHTML = "";

  // reset audio
  if (callAudio) {
    callAudio.pause();
    callAudio.currentTime = 0;
  }

  // reset noti/điện thoại
  roomPhone.classList.add("hidden");
  roomNoti.classList.add("hidden");

  // bắt đầu lại intro
  setTimeout(startRoomIntro, 300);
}

// -------- KHỞI CHẠY --------

resetGame();
