/**
 * Bug
 * 1. click chậm vào thanh seek nó hoq nhận liền, phải click nhanh => fix nhấn chậm vẫn nhận
 * 2. hạn chế ngẫu nhiên lặp lại bài hát nhiều lần, (tạo mảng cho phát ngẫu nhiên mỗi bài là 1 id cho vào mảng nếu trùng id trong mảng thì bỏ qua
 * sau khi hát hết tất cả bài hát thì clear mảng vào cho random lại từ đầu)
 * 3. sử dụng scroll into view làm sao cho nó hiện đc những thằng đầu (nếu index là 1 2 3, .. thì set cho nó block là center còn lại thì
 * set cho nó là block: 'nearest')
 */

const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);

const PLAYER_STORAGE_kEY = 'TTNB_PLAYER';

const player = $('.player');
const heading = $('header h2');
const cdThumb = $('.cd-thumb');
const audio = $('#audio');
const cd = $('.cd');
const playBtn = $('.btn-toggle-play');
const progress = $('#progress');
const prevBtn = $('.btn-prev');
const nextBtn = $('.btn-next');
const randomBtn = $('.btn-random');
const repeatBtn = $('.btn-repeat');
const playlist = $('.playlist');


const app = {
    currentIndex: 0,
    isPlaying: false,
    isRandom: false,
    isRepeat: false,
    config: JSON.parse(localStorage.getItem(PLAYER_STORAGE_kEY)) || {},
    songs: [
        {
            name: 'Đập vỡ cây đàn',
            singer: 'Dương Quốc Lợi',
            path: './assets/music/LoiCute.mp3',
            image: './assets/img/LoiCute.jpg'
        },
        
        {
            name: 'Let My Down Slowly',
            singer: 'Alec Benjamin',
            path: './assets/music/Let Me Down Slowly.mp3',
            image: './assets/img/Let me down.jpg'
        },

        {
            name: 'Nụ cười em là nắng',
            singer: 'Ẩn danh',
            path: './assets/music/Nụ Cười Em Là Nắng.mp3',
            image: './assets/img/Nụ cười em là nắng.jpg'
        },

        {
            name: 'Something just like this',
            singer: 'The Chainsmokers',
            path: './assets/music/Something Just Like This.mp3',
            image: './assets/img/something just like this.jpg'
        },

        {
            name: 'Sweet But Psycho',
            singer: 'Ava-Max',
            path: './assets/music/Sweet But Psycho - Ava Max.mp3',
            image: './assets/img/Sweet But Psycho.jpg'
        },

        {
            name: 'Tháng tư là lời nối dối của em',
            singer: 'Hà Anh Tuấn',
            path: './assets/music/ThangTuLaLoiNoiDoiCuaEm-HaAnhTuan-4609544.mp3',
            image: './assets/img/Tháng tư là lời nói dối của em.jpg'
        },

        {
            name: 'Tuý Âm',
            singer: 'Ẩn Danh',
            path: './assets/music/Tuý Âm.mp3',
            image: './assets/img/Tuý Âm.jpg'
        },

        {
            name: 'Đám cưới nha',
            singer: 'Hồng Thanh',
            path: './assets/music/Đám cưới nha.mp3',
            image: './assets/img/Đám cưới nha.jpg'
        },

        {
            name: 'Đường tôi chở em về',
            singer: 'Bùi Trường Linh',
            path: './assets/music/Đường tôi chở em về.mp3',
            image: './assets/img/đường tôi chở em về.jpg'
        },
    ],
    setConfig: function (key, value) {
        this.config[key] = value;
        localStorage.setItem(PLAYER_STORAGE_kEY, JSON.stringify(this.config))
    },

    render: function () {
        const htmls = this.songs.map((song, index) => {
            return `
            <div class="song ${index === this.currentIndex ? 'active' : ''}" data-index="${index}">
                <div class="thumb"
                    style="background-image: url('${song.image}')">
                </div>
                <div class="body">
                    <h3 class="title">${song.name}</h3>
                    <p class="author">${song.singer}</p>
                </div>
                <div class="option">
                    <i class="fas fa-ellipsis-h"></i>
                </div>
            </div> `
        })

        playlist.innerHTML = htmls.join('');
    },

    defineProperties: function () {
        Object.defineProperty(this, 'currentSong', {
            get: function () {
                return this.songs[this.currentIndex];
            }
        })
    },

    handleEvent: function () {
        const _this = this;
        const cdWidth = cd.offsetWidth;

        // Xử lý CD quay/ dừng
        const cdThumbAnimate = cdThumb.animate([
            { transform: 'rotate(360deg)' }
        ], {
            duration: 10000, //10 seconds
            iterations: Infinity,
        })
        cdThumbAnimate.pause();

        // xử lý phóng to / thu nhỏ CD
        document.onscroll = function () {
            const scrollTop = window.scrollY || document.documentElement.scrollTop;
            const newCdWidth = cdWidth - scrollTop;

            cd.style.width = newCdWidth > 0 ? newCdWidth + 'px' : 0;
            cd.style.opacity = newCdWidth / cdWidth;
        }

        // Xử lý khi click play 
        playBtn.onclick = function () {
            if (_this.isPlaying) {
                audio.pause();
            } else {
                audio.play();
            }
        }

        // khi song play
        audio.onplay = function () {
            _this.isPlaying = true;
            player.classList.add('playing');
            cdThumbAnimate.play();
        }

        // khi song pause
        audio.onpause = function () {
            _this.isPlaying = false;
            player.classList.remove('playing');
            cdThumbAnimate.pause();
        }

        // Khi tiến độ bài hát thay đổi
        audio.ontimeupdate = function () {
            if (audio.duration) {
                const progressPercent = Math.floor(audio.currentTime / audio.duration * 100);
                progress.value = progressPercent;
            }
        }

        // Xử lý khi tua song
        progress.onchange = function (e) {
            const seekTime = (e.target.value * audio.duration) / 100;
            audio.currentTime = seekTime;
        }

        // khi next song
        nextBtn.onclick = function () {
            if (_this.isRandom) {
                _this.playRandomSong();
            } else {
                _this.nextSong();
            }
            audio.play();
            _this.render();
            _this.scrollToActiveSong();
        }

        // khi prev song
        prevBtn.onclick = function () {
            if (_this.isRandom) {
                _this.playRandomSong();
            } else {
                _this.prevSong();
            }
            audio.play();
            _this.render();
            _this.scrollToActiveSong();
        }

        // Xử lý bật / tắt random
        randomBtn.onclick = function () {
            _this.isRandom = !_this.isRandom;
            _this.setConfig('isRandom', _this.isRandom);
            randomBtn.classList.toggle('active', _this.isRandom);
        }

        // Xử lý lặp lại 1 song
        repeatBtn.onclick = function () {
            _this.isRepeat = !_this.isRepeat;
            _this.setConfig('isRepeat', _this.isRepeat);
            repeatBtn.classList.toggle('active', _this.isRepeat);
        }

        // Xử lý next song khi ended
        audio.onended = function () {
            if (_this.isRepeat) {
                audio.play();
            } else {
                nextBtn.click();
            }
        }

        // lắng nghe hành vi click vào playlist
        playlist.onclick = function (e) {
            const songNode = e.target.closest('.song:not(.active)');


            if (songNode || e.target.closest('.option')) {    //===> closets trả về chính nó hoặc cha của nó nếu ko tìm thấy thì trả về Null
                // Xử lý khi click vào song
                if (songNode) {
                    // console.log(songNode.getAttribute('data-index'));  ==> ngoài ra còn có thể lấy bằng cách dataset
                    // console.log(songNode.dataset.index);
                    _this.currentIndex = Number(songNode.dataset.index);
                    _this.loadCurrentSong();
                    audio.play();
                    _this.render();
                }
                // Xử lý khi click vào option
                if (e.target.closest('.option')) {

                }
            }
        }
    },

    scrollToActiveSong: function () {
        setTimeout(() => {
            $('.song.active').scrollIntoView({
                behavior: 'smooth',
                block: 'nearest',
            })
        }, 500)
    },

    loadCurrentSong: function () {
        heading.textContent = this.currentSong.name;
        cdThumb.style.backgroundImage = `url('${this.currentSong.image}')`;
        audio.src = this.currentSong.path;
    },

    loadConfig: function () {
        this.isRandom = this.config.isRandom;
        this.isRepeat = this.config.isRepeat;
    },

    nextSong: function () {
        this.currentIndex++;
        if (this.currentIndex >= this.songs.length) {
            this.currentIndex = 0;
        }
        this.loadCurrentSong();
    },

    prevSong: function () {
        this.currentIndex--;
        if (this.currentIndex < 0) {
            this.currentIndex = this.songs.length - 1;
        }
        this.loadCurrentSong();
    },

    playRandomSong: function () {
        let newIndex;
        do {
            newIndex = Math.floor(Math.random() * this.songs.length)
        } while (newIndex === this.currentIndex)

        this.currentIndex = newIndex;
        this.loadCurrentSong();
    },

    start: function () {
        // Gán cấu hình từ config vào ứng dụng 
        this.loadConfig();

        // định nghĩa các thuộc tính cho Oject
        this.defineProperties();

        // Lắng nghe và xử lý các sự kiện (DOM events)
        this.handleEvent();

        // tải thông tin bài hát đầu tiên vào UI khi chạy ứng dụng
        this.loadCurrentSong();

        // Render Playlist
        this.render();

        // hiển thị trạng thái ban đầu của button repeat & button random
        randomBtn.classList.toggle('active', this.isRandom);
        repeatBtn.classList.toggle('active', this.isRepeat);
    }
}

app.start();