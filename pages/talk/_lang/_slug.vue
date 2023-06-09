<template>
  <div>
    <div class="chat-container">
      <div ref="messageList" class="message-list">
        <div v-for="(n, i) in chatMessage" :key="i" class="message">
          <!-- AIからのメッセージ -->
          <div v-if="n.sender === 'ai'">
            <div class="user-content">
              <img src="/teachar.png" class="icon" alt="User 1 Icon" />
              <span class="username">{{teachar.name}}:</span>
            </div>
            <div class="message-content">
              <span class="text">{{ n.text }}</span>
              <div v-if="n.audio !== ''" class="audio">
                <button
                  :class="{ playing: isPlaying && n.audio === currentAudio }"
                  @click="toggleAudio(n.audio)"
                >
                  <svg
                    v-if="isPlaying && n.audio === currentAudio"
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                  >
                    <rect x="6" y="4" width="4" height="16" fill="currentColor"></rect>
                    <rect x="14" y="4" width="4" height="16" fill="currentColor"></rect>
                  </svg>
                  <svg
                    v-else
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                  >
                    <path d="M8 5v14l11-7z" fill="currentColor" />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          <!-- ユーザーからのメッセージ -->
          <div v-if="n.sender === 'user'">
            <div class="user-content">
              <img src="/you.png" class="icon" alt="User 2 Icon" />
              <span class="username">You:</span>
            </div>
            <div class="message-content">
              <span class="text">{{ n.text }}</span>
            </div>
          </div>
        </div>
        <div v-if="loading" class="loading"><span class="loader"></span></div>
      </div>

      <!-- メッセージ入力 -->
      <div class="input-area">
        <div class="input-text">
          <input
            ref="questionInput"
            v-model="questionEntered"
            name="question"
            type="text"
            placeholder="メッセージを入力"
          />
          <button
            @click.prevent="submitQ($route.params, questionEntered)"
            type="submit"
            class="flex items-center justify-center flex-none w-10 h-10 ml-2 bg-green-500 rounded-full"
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M22 2L11 13"
                stroke="white"
                stroke-width="1.5"
                stroke-linecap="round"
                stroke-linejoin="round"
              ></path>
              <path
                d="M22 2L15 22L11 13L2 9L22 2Z"
                stroke="white"
                stroke-width="1.5"
                stroke-linecap="round"
                stroke-linejoin="round"
              ></path>
            </svg>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { getPageData } from '~/utils/pageData';

export default {
  data() {
    return {
      questionEntered: "",
      errorMessage: null,
      loading: false, //ローディング中のフラグ
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
  //トークメイトの情報を取得
  async asyncData({ params }) {
    const { slug, lang } = params;
    const pageData = getPageData(slug, lang);
    console.log(pageData);
    return {
      teachar: pageData
    };
  },
  methods: {
    // 質問が送信された場合
    async submitQ(params, questionEntered, isMounted = false) {
      this.loading = true;
      this.questionEntered = ""; // テキスト入力欄を空にする

      // スマートフォンの場合、仮想キーボードを閉じる
      if (
        /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
          navigator.userAgent
        )
      ) {
        this.$refs.questionInput.blur(); // フォーカスを外すことでキーボードを閉じる
      }

      //最初の質問は無視する
      if (!isMounted) {
        this.chatMessage.push({ sender: "user", text: questionEntered });
      }
      try {
        // get data
        const response = await this.$axios.$post(
          `/rcms-api/1/${params.lang}/${params.slug}?_lang=${params.lang}&text=${questionEntered}`
        );
        //デコード処理
        const base64EncodedData = response.mp3.audioContent;
        const decodedData = window.atob(base64EncodedData);
        const uint8Array = new Uint8Array(decodedData.length);
        for (let i = 0; i < decodedData.length; i++) {
          uint8Array[i] = decodedData.charCodeAt(i);
        }
        const blob = new Blob([uint8Array], { type: "audio/mp3" });
        this.audioSrc = URL.createObjectURL(blob);
        //ローディング終了
        this.loading = false;
        //メッセージ追加
        this.chatMessage.push({
          sender: "ai",
          text: response.answer,
          audio: this.audioSrc,
        });
        //回答後下部に移動
        this.$nextTick(() => {
          this.scrollToBottom();
        });
      } catch (error) {
        this.errorMessage = error.response;
        //ローディング終了
        this.loading = false;
        //メッセージ追加
        this.chatMessage.push({
          sender: "ai",
          text: "sorry some error happend. please try again",
        });
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
    //console.log(this.$route.params.lang);
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

    //console.log(firstQuestion);
    this.submitQ(this.$route.params, firstQuestion, true);
  },
};
</script>
