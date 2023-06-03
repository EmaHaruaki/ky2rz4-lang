<template>
  <div>
    <div class="chat-container">
      <div ref="messageList" class="message-list">
        <div v-for="(n, i) in chatMessage" :key="i" class="message">
          <!-- AIからのメッセージ -->
          <div v-if="n.sender === 'ai'">
            <div class="user-content">
              <img src="user1-icon.png" class="icon" alt="User 1 Icon" />
              <span class="username">John Doe:</span>
            </div>
            <div class="message-content">
              <span class="text">{{ n.text }}</span>
              <div v-if="n.audio !== ''" class="audio">
                <button
                  :class="{ playing: isPlaying && n.audio === currentAudio }"
                  @click="toggleAudio(n.audio)"
                >
                  {{ isPlaying && n.audio === currentAudio ? "停止" : "再生" }}
                </button>
              </div>
            </div>
          </div>

          <!-- ユーザーからのメッセージ -->
          <div v-if="n.sender === 'user'">
            <div class="user-content">
              <img src="user2-icon.png" class="icon" alt="User 2 Icon" />
              <span class="username">Jane Smith:</span>
            </div>
            <div class="message-content">
              <span class="text">{{ n.text }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- メッセージ入力 -->
      <div class="input-area">
        <div class="input-text">
          <input
            v-model="questionEntered"
            name="question"
            type="text"
            placeholder="メッセージを入力"
          />
          <button @click.prevent="submitQ($route.params)">送信</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      questionEntered: "",
      errorMessage: null,
      isPlaying: false, // 音声が再生中かどうかを示すフラグ
      currentAudio: "", // 現在再生中の音声のソースURL
      chatMessage: [
        {
          sender: "",
          text: "",
          audio: "",
        },
      ],
      audioSrc: "", // 再生する音声のソースURL
    };
  },
  methods: {
    // 質問が送信された場合
    async submitQ(params) {
      this.chatMessage.push({ sender: "user", text: this.questionEntered });
      try {
        const payload = {
          question: this.questionEntered,
        };
        // get data
        const response = await this.$axios.$post(
          `/rcms-api/1/${params.lang}/${params.slug}?_lang=${params.lang}&text=${this.questionEntered}`
        );
        const base64EncodedData = response.mp3.audioContent;
        const decodedData = window.atob(base64EncodedData);
        const uint8Array = new Uint8Array(decodedData.length);
        for (let i = 0; i < decodedData.length; i++) {
          uint8Array[i] = decodedData.charCodeAt(i);
        }
        const blob = new Blob([uint8Array], { type: "audio/mp3" });
        this.audioSrc = URL.createObjectURL(blob);
        this.chatMessage.push({
          sender: "ai",
          text: response.answer,
          audio: this.audioSrc,
        });
        this.$nextTick(() => {
          this.scrollToBottom();
        });
      } catch (error) {
        this.errorMessage = error.response;
      }
    },
    //最初の質問
    async processQuestion(question, params) {
      try {
        const response = await this.$axios.$post(
          `/rcms-api/1/${params.lang}/${params.slug}?_lang=${params.lang}&text=${question}`
        );
        const base64EncodedData = response.mp3.audioContent;
        const decodedData = window.atob(base64EncodedData);
        const uint8Array = new Uint8Array(decodedData.length);
        for (let i = 0; i < decodedData.length; i++) {
          uint8Array[i] = decodedData.charCodeAt(i);
        }
        const blob = new Blob([uint8Array], { type: "audio/mp3" });
        this.audioSrc = URL.createObjectURL(blob);
        this.chatMessage.push({
          sender: "ai",
          text: response.answer,
          audio: this.audioSrc,
        });
      } catch (error) {
        this.errorMessage = error.response;
      }
    },
    // 音声の再生/停止を切り替える
    toggleAudio(audioSrc) {
      if (this.isPlaying && audioSrc === this.currentAudio) {
        // 再生中であれば停止する
        this.stopAudio();
      } else {
        // 停止中であれば再生する
        this.playAudio(audioSrc);
      }
    },
    // 音声を再生する
    playAudio(audioSrc) {
      if (this.isPlaying) {
        // 既に再生中の場合は何もしない
        return;
      }
      this.currentAudio = audioSrc;
      this.isPlaying = true;

      const audio = new Audio(audioSrc);
      audio.play();

      // 再生が終了したらフラグをリセットする
      audio.addEventListener("ended", () => {
        this.stopAudio();
      });
    },
    // 音声を停止する
    stopAudio() {
      const audio = new Audio(this.currentAudio);
      audio.pause();
      audio.currentTime = 0;

      this.isPlaying = false;
      this.currentAudio = "";
    },
    // 最下部までスクロール
    scrollToBottom() {
      const messageList = this.$refs.messageList;
      const lastMessage = messageList.lastElementChild;
      if (lastMessage) {
        lastMessage.scrollIntoView({ behavior: "smooth", block: "end" });
      }
    },
  },
  mounted() {
    console.log(this.$route.params.lang);
    let firstQuestion;

    if (this.$route.params.lang === "en") {
      firstQuestion =
        "You are an English teacher. Greet your students and throw one simple question for free talk.";
    } else if (this.$route.params.lang === "ja") {
      firstQuestion =
        "あなたは日本語の先生です。生徒に挨拶をして、自由な話題のための簡単な質問を投げかけてください。";
    } else {
      // デフォルトの処理を指定（例えば、英語の場合の文言を代入する）
      firstQuestion =
        "You are an English teacher. Greet your students and throw one simple question for free talk.";
    }

    console.log(firstQuestion);
    this.processQuestion(firstQuestion, this.$route.params);
  },
};
</script>
