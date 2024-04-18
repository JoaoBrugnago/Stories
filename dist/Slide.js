import Timeout from "./Timeout.js";
export default class Slide {
    constructor(container, slides, controls, time = 5000) {
        Object.defineProperty(this, "container", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "slides", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "controls", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "time", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "index", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "slide", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "timeout", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "pausedTimeout", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "paused", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "thumbItems", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "thumb", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this.container = container;
        this.slides = slides;
        this.controls = controls;
        this.time = time;
        this.index = localStorage.getItem('activeSlide') ? Number(localStorage.getItem('activeSlide')) : 0; //-- index inicial
        this.slide = this.slides[this.index]; //-- slide inicial
        this.paused = false;
        this.thumbItems = null;
        this.thumb = null;
        this.timeout = null;
        this.pausedTimeout = null;
        this.init();
    }
    hide(el) {
        el.classList.remove('active');
        if (el instanceof HTMLVideoElement) {
            el.currentTime = 0; //-- Colocando o video para o inicio
            el.pause();
        }
    }
    show(index) {
        this.index = index;
        this.slide = this.slides[this.index]; //-- Slide ativo no momento
        localStorage.setItem('activeSlide', String(this.index));
        //-- thumb
        if (this.thumbItems) {
            this.thumb = this.thumbItems[this.index];
            this.thumbItems.forEach((el) => el.classList.remove('active'));
            this.thumb?.classList.add('active');
        }
        //-- Limpar as classes e setar para o novo elemento
        this.slides.forEach(slide => this.hide(slide));
        this.slides[index].classList.add('active');
        //-- Se for video, o tempo será o tempo de duração do próprio vídeo
        if (this.slide instanceof HTMLVideoElement) {
            this.autoVideo(this.slide);
        }
        else {
            this.auto(this.time);
        }
    }
    autoVideo(video) {
        video.muted = true;
        video.play();
        let firstPlay = true;
        video.addEventListener('playing', () => {
            if (firstPlay)
                this.auto(video.duration * 1000); //-- Para milissegundos
            firstPlay = false;
        });
    }
    auto(time) {
        this.timeout?.clear();
        this.timeout = new Timeout(() => this.next(), time);
        if (this.thumb)
            this.thumb.style.animationDuration = `${time}ms`;
    }
    prev() {
        if (this.paused)
            return;
        const total = this.slides.length - 1;
        const prev = this.index > 0 ? this.index - 1 : total;
        this.show(prev);
    }
    next() {
        if (this.paused)
            return;
        const total = this.slides.length - 1;
        const next = this.index < total ? this.index + 1 : 0;
        this.show(next);
    }
    pause() {
        document.body.classList.add('paused');
        this.pausedTimeout = new Timeout(() => {
            this.timeout?.pause();
            this.paused = true;
            this.thumb?.classList.add('paused');
            if (this.slide instanceof HTMLVideoElement) {
                this.slide.pause();
            }
        }, 300);
    }
    continue() {
        document.body.classList.remove('paused');
        this.pausedTimeout?.clear();
        if (this.paused) {
            this.paused = false;
            this.timeout?.continue();
            this.thumb?.classList.remove('paused');
            if (this.slide instanceof HTMLVideoElement) {
                this.slide.play();
            }
        }
    }
    addControls() {
        const prevButton = document.createElement('button');
        const nextButton = document.createElement('button');
        prevButton.innerText = 'Slide anterior';
        nextButton.innerText = 'Próximo slide';
        this.controls.appendChild(prevButton);
        this.controls.appendChild(nextButton);
        this.controls.addEventListener('pointerdown', () => this.pause());
        document.addEventListener('pointerup', () => this.continue());
        document.addEventListener('touchend', () => this.continue());
        prevButton.addEventListener('pointerup', () => this.prev());
        nextButton.addEventListener('pointerup', () => this.next());
    }
    addThumbItems() {
        const thumbContainer = document.createElement('div');
        thumbContainer.id = 'slide-thumb';
        for (let i = 0; i < this.slides.length; i++) {
            thumbContainer.innerHTML += `
      <span><span class='thumb-item'></span></span>
      `;
        }
        ;
        this.controls.appendChild(thumbContainer);
        this.thumbItems = Array.from(document.querySelectorAll('.thumb-item'));
    }
    init() {
        this.addControls(); //-- Criar controles iniciais
        this.addThumbItems(); //-- Criar thumb
        this.show(this.index); //-- mostrar slide inicial
    }
}
