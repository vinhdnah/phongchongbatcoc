const roomScene = document.getElementById("room-scene");
const roomGirl = document.getElementById("room-girl");
const roomPhone = document.getElementById("room-phone");
const roomNoti = document.getElementById("room-noti");
const tingAudio = document.getElementById("ting-audio");
let chatQ1Blocked = false; // đã chặn Crush hay chưa

const dialogLayer = document.getElementById("dialog-layer");
const callAudio = document.getElementById("call-audio");

let scene = "room"; // room -> chat_q1 -> call -> call_question -> q3 -> win/gameover
let isFinished = false;

// ===== MENU & NHẠC CHỜ =====
const menuLayer = document.getElementById("menu-layer");
const bgAudio   = document.getElementById("bg-audio");

function playMenuMusic() {
  if (!bgAudio) return;
  try {
    bgAudio.volume = 0.5;
    bgAudio.currentTime = 0;
    bgAudio.play();
  } catch (_) {}
}

function fadeOutMenuMusic(cb) {
  if (!bgAudio) { cb && cb(); return; }
  let v = bgAudio.volume;
  const id = setInterval(() => {
    v = Math.max(0, v - 0.05);
    bgAudio.volume = v;
    if (v <= 0) {
      clearInterval(id);
      try { bgAudio.pause(); } catch (_) {}
      cb && cb();
    }
  }, 50);
}

function showStartMenu() {
  if (menuLayer) menuLayer.style.display = "flex";
  playMenuMusic();
  const btn = document.getElementById("btn-start");
  if (btn) {
    btn.onclick = () => {
      // tắt nhạc chờ, rồi bắt đầu game
      fadeOutMenuMusic(() => {
        if (menuLayer) menuLayer.style.display = "none";
        // BẮT ĐẦU GAME: gọi resetGame() để chạy lại intro phòng ngủ như flow hiện có
        if (typeof resetGame === "function") resetGame();
        else if (typeof startRoomIntro === "function") startRoomIntro();
      });
    };
  }
}

// -------- KHỞI ĐỘNG: PHÒNG NGỦ, ĐIỆN THOẠI RUNG --------

function startRoomIntro() {
  // hiện noti + cho nhân vật cầm điện thoại
  roomPhone.classList.remove("hidden");
  roomNoti.classList.remove("hidden");

  setTimeout(() => {
    roomNoti.classList.add("hidden");
    openInboxScene(); // 👉 vào màn danh sách chat, KHÔNG mở chatQ1 ngay
  }, 1500);
}

function openInboxScene() {
  window.chatQ1Blocked = window.chatQ1Blocked ?? false;
  window.inboxInitializedOnce = window.inboxInitializedOnce ?? false;
  window.q3ThreadUnlocked = window.q3ThreadUnlocked ?? false;
  window.fromDeclineFlow = window.fromDeclineFlow ?? false;

  scene = "inbox";
  isFinished = false;
  dialogLayer.classList.remove("hidden");
  dialogLayer.innerHTML = "";

  const phone = document.createElement("div");
  phone.className = "phone-shell";

  phone.innerHTML = `
    <div class="phone-header">
      <div class="phone-header-avatar"></div>
      <div class="phone-header-info">
        <div class="phone-header-name">
          <img
            src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQR_zuEOmVdXkjVgDXJvMJb_RTtb0bt5xaP8A&s"
            class="messenger-logo" alt="Messenger logo"
          />
          Messenger
        </div>
        <div class="phone-header-sub">Bạn bè · Một trường THPT</div>
      </div>
    </div>
    <div class="inbox-list" id="inbox-list"></div>
  `;

  dialogLayer.appendChild(phone);
  const inbox = phone.querySelector("#inbox-list");

  function createInboxItem(label, preview, time, opts = {}) {
    const item = document.createElement("div");
    let extraClass = "";
    if (opts.isCrush && window.chatQ1Blocked) extraClass = " inbox-item-crush-blocked";
    else if (opts.isCrush) extraClass = " inbox-item-crush";

    item.className = "inbox-item" + extraClass;
    if (opts.id) item.dataset.id = opts.id;

    item.innerHTML = `
      <div class="inbox-avatar${opts.isCrush ? " avatar-crush" : ""}">
        ${opts.avatarText || label.charAt(0)}
      </div>
      <div class="inbox-main">
        <div class="inbox-name">${label}</div>
        <div class="inbox-preview">${preview}</div>
      </div>
      <div class="inbox-time">${time || ""}</div>
    `;
    if (typeof opts.onClick === "function") item.addEventListener("click", opts.onClick);
    return item;
  }

  // ---- CRUSH ----
  const CRUSH_NAME = "Tài khoản lạ";
  const addCrush = () => {
    const isBlocked = !!window.chatQ1Blocked;
    const preview   = isBlocked ? "Đã chặn người này" : "Mình ngưỡng mộ bạn từ...";
    const timeLabel = isBlocked ? "" : "Vừa xong";

    const crushItem = document.createElement("div");
    crushItem.className = "inbox-item" + (isBlocked ? " inbox-item-crush-blocked" : " inbox-item-crush");
    crushItem.dataset.id = "crush";
    crushItem.innerHTML = `
      <div class="inbox-avatar${isBlocked ? "" : " avatar-crush"}">C</div>
      <div class="inbox-main">
        <div class="inbox-name">${CRUSH_NAME}</div>
        <div class="inbox-preview">${preview}</div>
      </div>
      <div class="inbox-time">${timeLabel}</div>
    `;
    crushItem.addEventListener("click", () => openChatQ1());
    inbox.prepend(crushItem);
  };

  const crushDelay = window.inboxInitializedOnce ? 0 : 800;
  setTimeout(addCrush, crushDelay);
  window.inboxInitializedOnce = true;

  // ---- TÀI KHOẢN ẨN DANH (Q3) ----
  if (window.q3ThreadUnlocked) {
    const addAnon = () => {
      const anonItem = createInboxItem(
        "Tài khoản ẩn danh",
        "Tao có hết ảnh của mày...",
        "Vừa xong",
        { id: "anon", avatarText: "Ẩn" }
      );
      anonItem.addEventListener("click", () => openAnonChatQ3());
      inbox.prepend(anonItem);
      try { playTing && playTing(); } catch (_) {}
      window.fromDeclineFlow = false;
    };

    const anonDelay = window.fromDeclineFlow ? 800 : 0;
    setTimeout(addAnon, anonDelay);
  }
}




function playTing() {
  if (!tingAudio) return;
  tingAudio.currentTime = 0;
  tingAudio.play().catch((err) => {
    console.log("Không phát được ting (trình duyệt chặn autoplay):", err);
  });
}

// Hiện thông báo thắng ở giữa trong 5s rồi tự ẩn
function showCenterWinNotice() {
  const n = document.createElement("div");
  n.className = "center-notice";
  n.innerHTML = `
    <div class="notice-title">🎉 Chúc mừng bạn đã thoát hiểm!</div>
    <div class="notice-sub">
      Bạn đã hành động an toàn: không nghe cuộc gọi giả mạo và không làm theo yêu cầu.
    </div>
  `;
  document.body.appendChild(n);

  setTimeout(() => {
    n.classList.add("fade-out");
    setTimeout(() => n.remove(), 500); // khớp animation 0.5s
  }, 5000);
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

  let isChatQ1Active = true;
  let q1AnsweredCorrect = false;
  const timeouts = [];

  const layout = document.createElement("div");
  layout.className = "dialog-layout";

  const avatarCol = document.createElement("div");
  avatarCol.className = "dialog-avatar";
  avatarCol.innerHTML = `
    <img class="avatar-circle" src="img/avatar-boy.webp" alt="Nam sinh lớp 12" />
    <div class="avatar-name">Nam sinh · Lớp 12</div>
    <div style="font-size:12px;color:#9ca3af;text-align:center">
      Bạn đang ngồi trong phòng học buổi tối thì nhận được tin nhắn từ một tài khoản lạ...
    </div>
  `;

  const phone = document.createElement("div");
  phone.className = "phone-shell no-scrollbar";
  phone.innerHTML = `
    <div class="phone-header">
      <button class="back-btn" id="back-to-inbox">←</button>
      <img class="phone-header-avatar avatar-crush" src="img/avatar-girl.png" alt="Crush Bắc Sơn" />
      <div class="phone-header-info">
        <div class="phone-header-name">Tài khoản lạ</div>
        <div class="phone-header-sub">Hoạt động gần đây</div>
      </div>
    </div>
    <div class="phone-body" id="chat-body"></div>
    <div id="q1-after-messages"></div>
  `;

  const backBtn  = phone.querySelector("#back-to-inbox");
  const chatBody = phone.querySelector("#chat-body");
  const afterMsg = phone.querySelector("#q1-after-messages");
  const ting     = document.getElementById("ting-audio");
  const applause = document.getElementById("applause-audio");

  backBtn.addEventListener("click", () => {
    isChatQ1Active = false;
    while (timeouts.length) clearTimeout(timeouts.pop());
    openInboxScene();
    if (q1AnsweredCorrect) setTimeout(() => openCallScene(), 3000);
  });

  if (window.chatQ1Blocked) {
    chatBody.innerHTML = `<div class="blocked-msg">Bạn đã chặn người này</div>`;
    layout.appendChild(avatarCol);
    layout.appendChild(phone);
    dialogLayer.appendChild(layout);
    return;
  }

  function createTypingIndicator() {
    const typing = document.createElement("div");
    typing.className = "typing-indicator";
    typing.innerHTML = `<span></span><span></span><span></span>`;
    return typing;
  }
  function playTingSafe() {
    if (!isChatQ1Active) return;
    if (ting) { try { ting.currentTime = 0; ting.play(); } catch(_){} }
  }

  // ===== DIỄN TIẾN TIN NHẮN =====
  const typing1 = createTypingIndicator();
  chatBody.appendChild(typing1);

  timeouts.push(setTimeout(() => {
    if (!isChatQ1Active) return;
    typing1.remove();

    chatBody.insertAdjacentHTML("beforeend", `
      <div class="bubble them">Chào bạn, mình thấy bạn rất dễ thương nên muốn kết bạn làm quen.</div>
      <div class="bubble-meta">Đã gửi · 1 phút trước</div>
    `);
    playTingSafe();

    const typing2 = createTypingIndicator();
    chatBody.appendChild(typing2);

    timeouts.push(setTimeout(() => {
      if (!isChatQ1Active) return;
      typing2.remove();

      chatBody.insertAdjacentHTML("beforeend", `
        <div class="bubble them">
          Mình theo dõi bạn một thời gian rồi, cảm giác bạn đang có chuyện gì buồn? 
          Bạn cứ chia sẻ với mình nhé, mình muốn làm bạn tâm sự online của bạn.
        </div>
        <div class="bubble-meta">Đã gửi</div>
      `);
      playTingSafe();
      renderFooterAndChoices();
    }, 2000));
  }, 3500));

  // ===== CÂU HỎI & LỰA CHỌN =====
  function renderFooterAndChoices() {
    if (!isChatQ1Active) return;

    const footer = document.createElement("div");
    footer.className = "phone-footer";
    footer.textContent = "Câu hỏi 1: Bạn sẽ làm gì khi nhận được tin nhắn thân mật từ một người chưa từng quen biết như thế này? ";

    const choices = document.createElement("div");
    choices.className = "choice-panel";

    // A - sai
    choices.appendChild(
      createChoiceBtn(
        "A",
        "Nghĩ đây là người hâm mộ dễ thương → kể chuyện riêng tư.",
        () => {
          showGameOver(
            "Bạn bị lời khen & thân mật quá mức làm mờ cảnh giác. Đây là bước khởi đầu để thao túng/lừa đảo."
          );
        }
      )
    );

    // B - đúng (tự động quay Inbox sau 5s, rồi 3s sau có cuộc gọi)
    choices.appendChild(
      createChoiceBtn(
        "B",
        "Nhận ra người lạ và chặn luôn",
        () => {
          q1AnsweredCorrect = true;
          window.chatQ1Blocked = true;

          if (applause) { try { applause.currentTime = 0; applause.volume = 0.8; applause.play(); } catch(_){} }

          // Ẩn câu hỏi + đáp án
          afterMsg.style.display = "none";

          // Hiện bảng chúc mừng
          chatBody.innerHTML = `
            <div class="system-notice success">
              <div class="notice-icon">🏆</div>
              <div class="notice-title">Chúc mừng bạn đã thoát hiểm!</div>
              <div class="notice-sub">
                Bạn đã tránh được một hành vi tiếp cận mang tính thao túng và giả thân mật từ người lạ trên mạng.
              </div>
            </div>
          `;

          // ⏳ 5s sau tự quay về Inbox, rồi 3s sau rung cuộc gọi
          timeouts.push(setTimeout(() => {
            if (!isChatQ1Active) return;        // nếu user đã rời
            isChatQ1Active = false;
            openInboxScene();
            setTimeout(() => openCallScene(), 3000);
          }, 5000));
        }
      )
    );

    // C - đúng (quay Inbox ngay)
    choices.appendChild(
      createChoiceBtn(
        "C",
        "Thấy sợ, không trả lời và quyết định hỏi ý kiến bố mẹ/thầy cô.",
        () => {
          q1AnsweredCorrect = true;

          if (applause) { try { applause.currentTime = 0; applause.volume = 0.8; applause.play(); } catch(_){} }

          afterMsg.style.display = "none";
          isChatQ1Active = false;
          while (timeouts.length) clearTimeout(timeouts.pop());
          openInboxScene();
          setTimeout(() => openCallScene(), 3000);
        }
      )
    );

    afterMsg.innerHTML = "";
    afterMsg.appendChild(footer);
    afterMsg.appendChild(choices);
  }

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
    <img class="avatar-circle" src="img/avatar-boy.webp" alt="Nhân vật nam" />
    <div class="avatar-name">Nhân vật nam · Lớp 12</div>
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
        <div class="call-name">Công an mạng</div>
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

  // nhạc chuông
  if (ringtone) {
    try { ringtone.currentTime = 0; ringtone.volume = 0.8; ringtone.play(); } catch (_) {}
  }

  // ❌ TỪ CHỐI = quay về Inbox, rồi thread Ẩn danh sẽ "đến" sau 0.8s (giống Q1)
  btnDecline.addEventListener("click", () => {
    if (ringtone) { ringtone.pause(); ringtone.currentTime = 0; }
    window.q3ThreadUnlocked = true;     // để Inbox có thread ẩn danh
    window.fromDeclineFlow = true;      // báo cho Inbox biết cần tạo hiệu ứng trễ
    showCenterWinNotice();              // popup vượt ải (5s tự ẩn)
    openInboxScene();                   // quay về Inbox ngay
  });

  // ✅ Nhận cuộc gọi: flow cũ
  btnAccept.addEventListener("click", () => {
    if (ringtone) { ringtone.pause(); ringtone.currentTime = 0; }
    startCallAudio(phone);
  });
}




// ---------- bắt đàu cuộc gọi ----------
function startCallAudio(phoneShell) {
  const acceptBtn = phoneShell.querySelector("#btn-accept");
  const declineBtn = phoneShell.querySelector("#btn-decline");
  const headerSub = phoneShell.querySelector(".phone-header-sub");
  const timerEl   = phoneShell.querySelector("#call-timer");

  let seconds = 0;

  // Hiện timer + trạng thái
  if (timerEl) { timerEl.style.display = "block"; timerEl.textContent = "00:00"; }
  if (headerSub) headerSub.textContent = "Đang trong cuộc gọi...";

  // Ẩn nút từ chối; đổi nút nhận thành nút gác máy
  if (declineBtn) declineBtn.style.display = "none";
  if (acceptBtn) {
    acceptBtn.disabled = false;
    acceptBtn.classList.remove("accept");
    acceptBtn.classList.add("decline");
    acceptBtn.textContent = "✕";
  }

  // Đếm thời gian
  const timerId = setInterval(() => {
    seconds++;
    if (timerEl) {
      const m = String(Math.floor(seconds / 60)).padStart(2, "0");
      const s = String(seconds % 60).padStart(2, "0");
      timerEl.textContent = `${m}:${s}`;
    }
  }, 1000);

  function endCallAndGoQ2() {
    clearInterval(timerId);
    if (callAudio) { try { callAudio.pause(); callAudio.currentTime = 0; } catch(_){} }
    openCallQuestion();   // ✅ quay sang CÂU 2 như flow cũ
  }

  // Bấm ✕ để kết thúc cuộc gọi
  if (acceptBtn) acceptBtn.onclick = endCallAndGoQ2;

  // Phát audio cuộc gọi
  if (callAudio) {
    callAudio.currentTime = 0;
    callAudio.play().catch(()=>{});
    callAudio.onended = () => endCallAndGoQ2();
  }
}


// ----------Thêm hàm mới openAnonChatQ3()----------
function openAnonChatQ3() {
  scene = "q3_chat";
  dialogLayer.classList.remove("hidden");
  dialogLayer.innerHTML = "";

  let isActive = true;
  const timeouts = [];

  const layout = document.createElement("div");
  layout.className = "dialog-layout";

  // Cột avatar nhân vật chính (nam)
  const avatarCol = document.createElement("div");
  avatarCol.className = "dialog-avatar";
  avatarCol.innerHTML = `
    <img class="avatar-circle" src="img/avatar-boy.webp" alt="Nam sinh lớp 12" />
    <div class="avatar-name">Nam sinh · Lớp 12</div>
    <div style="font-size:12px;color:#9ca3af;text-align:center">
      Sau cuộc gọi, bạn nhận thêm tin nhắn nặc danh...
    </div>
  `;

  // Khung điện thoại
  const phone = document.createElement("div");
  phone.className = "phone-shell no-scrollbar";
  phone.innerHTML = `
    <div class="phone-header">
      <button class="back-btn" id="back-to-inbox">←</button>
      <div class="phone-header-info">
        <div class="phone-header-name">Tài khoản ẩn danh</div>
        <div class="phone-header-sub">Vừa hoạt động</div>
      </div>
    </div>
    <div class="phone-body" id="q3-chat-body"></div>
    <div id="q3-after-messages"></div>
  `;

  const backBtn   = phone.querySelector("#back-to-inbox");
  const chatBody  = phone.querySelector("#q3-chat-body");
  const afterBox  = phone.querySelector("#q3-after-messages");
  const tingAudio = document.getElementById("ting-audio");

  backBtn.addEventListener("click", () => {
    isActive = false;
    while (timeouts.length) clearTimeout(timeouts.pop());
    openInboxScene();
  });

  // helper
  function typing() {
    const t = document.createElement("div");
    t.className = "typing-indicator";
    t.innerHTML = `<span></span><span></span><span></span>`;
    return t;
  }
  function playTing() {
    if (!isActive) return;
    if (tingAudio) { try { tingAudio.currentTime = 0; tingAudio.play(); } catch(_){} }
  }
  function scrollBottom() {
    try { chatBody.scrollTop = chatBody.scrollHeight; } catch (_) {}
  }

  // ===== Hiệu ứng typing -> tin nhắn đe doạ =====
  const t1 = typing();
  chatBody.appendChild(t1);
  scrollBottom();

  timeouts.push(setTimeout(() => {
    if (!isActive) return;
    t1.remove();

    // Tin nhắn ẩn danh
    chatBody.insertAdjacentHTML("beforeend", `
      <div class="bubble them">
        Tao có hết ảnh của mày. 15 phút nữa, đến cổng trường <b>một mình</b>.
        Không đến là tao đăng hết ảnh lên mạng.
      </div>
      <div class="bubble-meta">Đã gửi</div>
    `);
    playTing();
    scrollBottom();

    // 👉 Chỉ bây giờ mới render câu hỏi + các phương án
    renderQ3Question();

  }, 1800));

  // ===== Render câu hỏi + lựa chọn SAU khi tin nhắn đã hiện xong =====
  function renderQ3Question() {
    if (!isActive) return;

    // Dòng câu hỏi
    const footer = document.createElement("div");
    footer.className = "phone-footer";
    footer.textContent = "Câu hỏi 3: Hành động nào giúp bạn còn đường sống an toàn nhất?";

    // Lựa chọn
    const panel = document.createElement("div");
    panel.className = "choice-panel";

    // A - sai
    panel.appendChild(
      createChoiceBtn("A", "Lén tới gặp một mình để cầu xin, mong hắn xóa ảnh.", () => {
        showGameOver(
          "Đi gặp kẻ xấu một mình là cực kỳ nguy hiểm. Bạn có thể bị tấn công, bắt cóc hoặc tiếp tục bị tống tiền."
        );
      })
    );

    // B - đúng (WIN)
    panel.appendChild(
      createChoiceBtn("B", "Ở yên trong nhà/trường, báo ngay cho giáo viên hoặc phụ huynh, sau đó gọi tổng đài 111.", () => {
        // Ẩn câu hỏi + lựa chọn trước khi chuyển kết quả (gọn UI)
        afterBox.style.display = "none";
        showWin();
      })
    );

    // C - sai
    panel.appendChild(
      createChoiceBtn("C", "Rủ thêm vài đứa bạn thân ra cổng trường đánh hắn cho bõ tức.", () => {
        showGameOver(
          "Dùng bạo lực không làm bạn an toàn hơn, mà còn có thể khiến bạn và bạn bè vi phạm pháp luật."
        );
      })
    );

    afterBox.innerHTML = "";
    afterBox.appendChild(footer);
    afterBox.appendChild(panel);
  }

  layout.appendChild(avatarCol);
  layout.appendChild(phone);
  dialogLayer.appendChild(layout);
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

  // A - Sai
  optionsDiv.appendChild(
    createChoiceBtn("A", "Vội vã chuyển ngay 200k để khỏi bị bắt, tính sau.", () => {
      showGameOver(
        "Bạn đã chủ động chuyển tiền cho kẻ mạo danh công an. Công an thật không làm việc qua Zalo, không dọa bắt và không yêu cầu chuyển 'lệ phí xác minh' vào tài khoản cá nhân."
      );
    })
  );

  // ✅ B - Đúng: quay về INBOX, mở khoá thread Ẩn danh; Q3 sẽ hiển thị như chat (typing → tin nhắn → mới hiện câu hỏi)
  optionsDiv.appendChild(
    createChoiceBtn(
      "B",
      "Cúp máy ngay, chặn số, lưu lại bằng chứng rồi báo với phụ huynh/giáo viên.",
      () => {
        // Mở khoá Câu 3 dưới dạng 1 thread mới ở Inbox
        window.q3ThreadUnlocked = true;
        window.fromDeclineFlow  = true;  // để Inbox có hiệu ứng 'vừa tới'
        openInboxScene();
        // (đừng gọi openQuestion3 trực tiếp nữa; thread 'Tài khoản ẩn danh' sẽ xuất hiện để người chơi bấm vào)
      }
    )
  );

  // C - Sai
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
      Sau khi bạn chặn số lạ, một tài khoản vô danh tiếp tục nhắn tin đe doạ:
    </div>
    <div class="chat-box">
      <div class="chat-label">Tin nhắn nặc danh</div>
      <div>
        "Tao có ảnh riêng tư của mày. 15 phút nữa ra khu vực trước trường,<b> một mình.</b>.
        Không thì tao đăng lên mạng."
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
      <b>C.L.O – Close Lies Online:</b> Không thỏa hiệp – Không hoảng loạn – Không đi một mình.<br/>
      Đó là bộ quy tắc an toàn khi đối mặt với các hành vi thao túng hoặc đe doạ trên không gian mạng.
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
  // --- trạng thái chung ---
  scene = "room";
  isFinished = false;

  // ✅ Reset mọi cờ về mặc định ban đầu
  window.chatQ1Blocked = false;        // chưa chặn crush
  window.q3ThreadUnlocked = false;     // chưa mở thread "Tài khoản ẩn danh"
  window.fromDeclineFlow = false;      // không phải vừa quay từ decline
  window.inboxInitializedOnce = false; // để lần mở Inbox đầu có delay "push" trở lại

  // --- dừng mọi âm thanh đang phát ---
  ["ringtone-audio", "call-audio", "win-audio", "lose-audio", "ting-audio"]
    .map(id => document.getElementById(id))
    .filter(Boolean)
    .forEach(a => { try { a.pause(); a.currentTime = 0; } catch(_){} });

  // --- reset UI ---
  const dialogLayer = document.getElementById("dialog-layer");
  const roomScene   = document.getElementById("room-scene");
  const roomPhone   = document.getElementById("room-phone");
  const roomNoti    = document.getElementById("room-noti");

  if (dialogLayer) {
    dialogLayer.classList.add("hidden");
    dialogLayer.innerHTML = "";
  }
  if (roomScene) roomScene.classList.remove("hidden");
  if (roomPhone) roomPhone.classList.add("hidden");
  if (roomNoti)  roomNoti.classList.add("hidden");

  // --- vào intro căn phòng rồi chuyển tiếp flow ---
  if (typeof startRoomIntro === "function") {
    setTimeout(() => startRoomIntro(), 400);
  }
}


// -------- KHỞI CHẠY --------
// ===== Mobile 100vh fix + flag is-mobile =====
(function () {
  function setVH() {
    // 1vh = 1% chiều cao viewport thực tế (trừ thanh URL)
    const vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty("--vh", `${vh}px`);
  }
  setVH();
  window.addEventListener("resize", setVH);

  // Gắn class để CSS biết đang ở mobile
  const isMobile =
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
    window.innerWidth <= 600;
  if (isMobile) document.documentElement.classList.add("is-mobile");
})();

// ===== START MENU + GREETING POPUP =====
window.addEventListener("load", () => {
  const menu   = document.getElementById("menu-layer");
  const btn    = document.getElementById("btn-start");
  const bg     = document.getElementById("bg-audio");   // nhạc nền chờ (loop)
  const greet  = document.getElementById("greet-modal");
  const btnOK  = document.getElementById("btn-greet-ok");

  // 1️⃣ Hiện menu và popup "Xin chào"
  if (menu)  menu.style.display  = "flex";
  if (greet) greet.style.display = "flex";

  // 2️⃣ Bấm OK -> phát nhạc chờ
  if (btnOK) {
    btnOK.addEventListener("click", () => {
      if (bg) {
        try {
          bg.volume = 0.5;
          bg.currentTime = 0;
          bg.play();
        } catch (_) {}
      }
      if (greet) greet.style.display = "none";
    });
  }

  // 3️⃣ Bấm Start -> DỪNG nhạc chờ + vào game
  if (btn) {
    btn.addEventListener("click", () => {
      // dừng nhạc chờ ngay
      if (bg) {
        try {
          bg.pause();
          bg.currentTime = 0;
        } catch (_) {}
      }
      // ẩn menu
      if (menu) menu.style.display = "none";
      // gọi hàm resetGame() để khởi động game
      if (typeof resetGame === "function") {
        setTimeout(() => resetGame(), 0);
      }
    });
  }
});
