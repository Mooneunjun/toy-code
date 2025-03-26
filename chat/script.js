/***********************************************************************
 * 主要改动：
 * 1) 消息渲染时，连续同一发送者的消息不重复显示姓名
 * 2) 生成字母头像时取消蓝底，调整圆球和文字居中
 * 3) 调整在线用户列表的更新逻辑，确保信息正确且不重复，
 *    并增加 admin 登录后请求在线用户功能，保证统计完整。
 * 4) 管理员清空记录功能修改为安全调用广播及仅清空当前房间记录，
 *    同时屏蔽离开广播，防止退出消息重新写入。
 * 5) 同一用户名仅允许在一个页面登录（通过比较 user.name 与 user.id）
 * 6) 防止重复发送离开房间消息：增加 isExiting 标志
 **********************************************************************/

let user = { id: "", name: "", avatar: "" };
let room = "";
let channel;
let messages = [];
let participants = []; // { userId, isAdmin, avatar, name }
let lastHour = null;
let typingTimer;
let isAdmin = false; // 是否管理员
let isClearing = false; // 标记是否正在清空记录
let isExiting = false; // 标记是否主动退出

// DOM
const setup = document.getElementById("setup");
const roomInput = document.getElementById("roomInput");
const nameInput = document.getElementById("nameInput");
const joinBtn = document.getElementById("joinBtn");

const chat = document.getElementById("chat");
const roomName = document.getElementById("roomName");
const userListBtn = document.getElementById("userListBtn");
const typingIndicator = document.getElementById("typingIndicator");
const exitBtn = document.getElementById("exitBtn");
const clearBtn = document.getElementById("clearBtn");

const messageList = document.getElementById("messageList");
const messageInput = document.getElementById("messageInput");
const sendBtn = document.getElementById("sendBtn");

const userListPanel = document.getElementById("userListPanel");
const userListUl = document.getElementById("userList");
const onlineCount = document.getElementById("onlineCount");

/* =============================
   生成字母头像：不使用蓝底，使用白底和浅灰边框，文字居中
============================= */
function getLetterAvatar(name) {
  const letter = name.charAt(0).toUpperCase();
  const svg = `<svg width="40" height="40" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
    <circle cx="20" cy="20" r="18" fill="#fff" stroke="#ccc" stroke-width="2"/>
    <text x="20" y="22" text-anchor="middle" fill="#333" font-size="20" font-family="Arial" dominant-baseline="middle">${letter}</text>
  </svg>`;
  return svg;
}

/* =============================
   加入房间
============================= */
joinBtn.onclick = () => {
  const r = roomInput.value.trim();
  const n = nameInput.value.trim();
  if (!r || !n) {
    alert("请输入房间名和昵称");
    return;
  }

  // 自动生成字母头像
  user.avatar = getLetterAvatar(n);
  user.id = `u-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  user.name = n;
  isAdmin = n.toLowerCase() === "admin";

  room = r;
  roomName.textContent = `房间：${room}`;

  setup.classList.add("hidden");
  chat.classList.remove("hidden");

  // 如果是 admin，则显示用户列表按钮及清空记录按钮
  if (isAdmin) {
    userListBtn.classList.remove("hidden");
    clearBtn.classList.remove("hidden");
  }

  // 清空在线用户列表，避免刷新后残留旧数据
  participants = [];

  // 加载历史记录并渲染
  loadLocalMessages();
  renderAllMessages();

  // 建立广播频道
  channel = new BroadcastChannel(`chat-${room}`);
  channel.onmessage = (e) => handleIncoming(e.data);

  // 非 admin 时，广播系统消息提示加入
  if (!isAdmin) {
    sendSystemMsg(`${user.name} 加入房间`, "join");
  }
  // 广播用户加入消息（用于在线列表更新）
  channel.postMessage({
    type: "user-join",
    userId: user.id,
    isAdmin: isAdmin,
    avatar: user.avatar,
    name: user.name,
  });

  // 如果是 admin，则主动请求所有在线用户信息
  if (isAdmin) {
    channel.postMessage({
      type: "user-list-request",
      requester: user.id,
    });
  }
};

/* =============================
   退出 & 清空记录
============================= */
exitBtn.onclick = () => {
  isExiting = true; // 标记主动退出，防止重复广播
  if (!isClearing) {
    if (!isAdmin) {
      sendSystemMsg(`${user.name} 离开房间`, "leave");
    }
    channel?.postMessage({
      type: "user-leave",
      userId: user.id,
    });
  }
  location.reload();
};

clearBtn.onclick = () => {
  if (!confirm("确定要清空所有聊天记录吗？")) return;
  isClearing = true; // 设置标记，屏蔽退出广播
  if (channel) {
    channel.postMessage({ type: "clearAll" });
  }
  // 仅清空当前房间的聊天记录，而非全部 localStorage
  localStorage.setItem(`chatHistory-${room}`, JSON.stringify([]));
  location.reload();
};

/* =============================
   收发消息
============================= */
sendBtn.onclick = () => {
  const content = messageInput.value.trim();
  if (!content) return;

  const now = new Date();
  if (isAdmin) {
    // 管理员发文以系统消息显示
    const sysMsg = {
      id: now.getTime() + Math.random(),
      type: "system",
      subType: "admin",
      content: content,
      time: now.toISOString(),
    };
    addMessage(sysMsg);
    channel.postMessage(sysMsg);
  } else {
    const msgData = {
      id: now.getTime() + Math.random(),
      type: "message",
      userId: user.id,
      avatar: user.avatar,
      name: user.name,
      content: content,
      time: now.toISOString(),
    };
    addMessage(msgData);
    channel.postMessage(msgData);
  }

  messageInput.value = "";
  sendBtn.disabled = true;
};

/* =============================
   BroadcastChannel 接收处理
============================= */
function handleIncoming(data) {
  switch (data.type) {
    case "typing":
      if (data.userId !== user.id) {
        typingIndicator.textContent = `对方正在输入...`;
        clearTimeout(typingTimer);
        typingTimer = setTimeout(() => {
          typingIndicator.textContent = "";
        }, 2000);
      }
      break;

    case "message":
      addMessage(data);
      break;

    case "system":
      addMessage(data);
      break;

    case "user-join":
      // 同一用户名只能在其他页面登录一个：若检测到同名但不同 id，则提示并退出
      if (data.name === user.name && data.userId !== user.id) {
        alert("该用户名已在其他页面登录，您已被迫退出");
        location.reload();
        return;
      }
      // 避免重复：先移除已有同一用户
      participants = participants.filter((u) => u.userId !== data.userId);
      participants.push({
        userId: data.userId,
        isAdmin: data.isAdmin,
        avatar: data.avatar,
        name: data.name,
      });
      updateUserListPanel();
      break;

    case "user-list-request":
      // 收到在线用户请求时，所有在线客户端回复自己的信息
      channel.postMessage({
        type: "user-join",
        userId: user.id,
        isAdmin: isAdmin,
        avatar: user.avatar,
        name: user.name,
      });
      break;

    case "user-leave":
      participants = participants.filter((u) => u.userId !== data.userId);
      updateUserListPanel();
      break;

    case "kickUser":
      if (data.targetId === user.id) {
        localStorage.removeItem(`chatHistory-${room}`);
        alert("您已被管理员踢出房间");
        location.reload();
      } else {
        removeUserMessages(data.targetId);
        participants = participants.filter((u) => u.userId !== data.targetId);
        updateUserListPanel();
      }
      break;

    case "clearAll":
      localStorage.setItem(`chatHistory-${room}`, JSON.stringify([]));
      location.reload();
      break;
  }
}

/* =============================
   系统消息 (存储 & 广播)
============================= */
function sendSystemMsg(content, subType) {
  const now = new Date();
  const sysMsg = {
    id: now.getTime() + Math.random(),
    type: "system",
    subType: subType,
    content: content,
    time: now.toISOString(),
  };
  addMessage(sysMsg);
  channel?.postMessage(sysMsg);
}

/* =============================
   消息存取 & 渲染
============================= */
function loadLocalMessages() {
  const stored = localStorage.getItem(`chatHistory-${room}`);
  messages = stored ? JSON.parse(stored) : [];
  messages.sort((a, b) => new Date(a.time) - new Date(b.time));
}

function saveLocalMessages() {
  localStorage.setItem(`chatHistory-${room}`, JSON.stringify(messages));
}

function renderAllMessages() {
  messageList.innerHTML = "";
  lastHour = null;
  messages.forEach((msg) => renderOneMessage(msg));
}

function addMessage(msg) {
  // 避免重复添加相同消息
  if (messages.some((m) => m.id === msg.id)) return;
  messages.push(msg);
  // 按消息时间排序
  messages.sort((a, b) => new Date(a.time) - new Date(b.time));
  saveLocalMessages();
  renderOneMessage(msg);
}

/* 
   渲染单条消息：
   对于连续同一发送者的消息（排除系统消息），仅在第一条显示姓名。
*/
function renderOneMessage(msg) {
  const date = new Date(msg.time);
  const hour = date.getHours();
  if (hour !== lastHour) {
    lastHour = hour;
    const divider = document.createElement("div");
    divider.className = "timestamp-divider";
    divider.textContent = `${hour}:00`;
    messageList.appendChild(divider);
  }

  // 系统消息直接显示
  if (msg.type === "system") {
    const div = document.createElement("div");
    div.className = "system-msg";
    div.textContent = msg.content;
    messageList.appendChild(div);
    messageList.scrollTop = messageList.scrollHeight;
    return;
  }

  const isSelf = msg.userId === user.id;
  const msgDiv = document.createElement("div");
  msgDiv.className = `message ${isSelf ? "self" : ""}`;
  // 设置自定义属性，方便后续判断连续消息
  msgDiv.dataset.userid = msg.userId;

  // 判断上一个消息是否为同一发送者（仅对普通消息有效）
  let showName = true;
  const renderedMessages = Array.from(messageList.children).filter(
    (el) => el.classList && el.classList.contains("message")
  );
  if (renderedMessages.length > 0) {
    const lastBubble = renderedMessages[renderedMessages.length - 1];
    if (lastBubble.dataset.userid === msg.userId) {
      showName = false;
    }
  }
  const nameHtml = showName ? `<div class="sender-name">${msg.name}</div>` : "";

  msgDiv.innerHTML = `
    <div class="avatar">${msg.avatar}</div>
    <div class="message-content">
      ${nameHtml}
      <div class="bubble">${msg.content}</div>
    </div>
  `;
  messageList.appendChild(msgDiv);
  messageList.scrollTop = messageList.scrollHeight;
  saveLocalMessages();
}

/* 删除指定用户的消息 */
function removeUserMessages(userId) {
  messages = messages.filter((m) => m.userId !== userId);
  saveLocalMessages();
  renderAllMessages();
}

/* =============================
   输入时通知对方正在输入
============================= */
messageInput.oninput = () => {
  const hasText = messageInput.value.trim().length > 0;
  sendBtn.disabled = !hasText;
  if (channel) {
    channel.postMessage({
      type: "typing",
      userId: user.id,
    });
  }
};

/* =============================
   Enter发送 + Shift换行
============================= */
messageInput.onkeydown = (e) => {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    sendBtn.click();
  }
};

/* =============================
   更新在线用户列表 (仅 admin)
============================= */
function updateUserListPanel() {
  if (!isAdmin) return;
  // 对参与者按用户名排序
  participants.sort((a, b) => a.name.localeCompare(b.name));
  userListUl.innerHTML = "";
  onlineCount.textContent = `(${participants.length})`;

  participants.forEach((u) => {
    const li = document.createElement("li");
    if (u.userId === user.id) {
      li.textContent = `【我自己】 (${u.name})`;
    } else {
      const avatarSpan = document.createElement("span");
      avatarSpan.innerHTML = u.avatar;

      const nameSpan = document.createElement("span");
      nameSpan.textContent = u.name || "未知";

      const btnKick = document.createElement("button");
      btnKick.className = "kick-btn";
      btnKick.textContent = "踢出";
      btnKick.onclick = () => {
        channel.postMessage({
          type: "kickUser",
          targetId: u.userId,
        });
        removeUserMessages(u.userId);
        participants = participants.filter((x) => x.userId !== u.userId);
        updateUserListPanel();
      };

      li.appendChild(avatarSpan);
      li.appendChild(nameSpan);
      li.appendChild(btnKick);
    }
    userListUl.appendChild(li);
  });
}

/* =============================
   点击查看在线用户列表 (仅 admin)
============================= */
userListBtn.onclick = () => {
  userListPanel.classList.toggle("hidden");
};

/* =============================
   离开前通知
============================= */
window.addEventListener("beforeunload", () => {
  // 如果正在清空记录或已主动退出，则不广播离开消息
  if (isClearing || isExiting) return;
  if (!isAdmin && channel) {
    sendSystemMsg(`${user.name} 离开房间`, "leave");
  }
  channel?.postMessage({ type: "user-leave", userId: user.id });
});
