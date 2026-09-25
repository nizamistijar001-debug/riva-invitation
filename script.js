document.addEventListener('DOMContentLoaded', () => {
    const puzzleContainer = document.getElementById('puzzleContainer');
    const puzzleSuccess = document.getElementById('puzzleSuccess');
    const startInvitationBtn = document.getElementById('startInvitationButton');
    const giveUpBtn = document.getElementById('giveUpButton');

    const puzzleCard = document.getElementById('puzzleCard');
    const firstCard = document.getElementById('firstCard');

    const totalPieces = 9;
    const gridCols = 3;
    let currentOrder = [];
    let selectedPieceIndex = null;
    let isSolved = false;

    // 1. Inisialisasi Puzzle
    function initPuzzle() {
        if (!puzzleContainer) return;
        puzzleContainer.innerHTML = '';
        currentOrder = [1, 5, 2, 0, 4, 7, 3, 6, 8]; // Urutan acak tetap
        renderPuzzle();
    }

    // 2. Render Kepingan
    function renderPuzzle() {
        puzzleContainer.innerHTML = '';

        // Ukuran per keping puzzle (258px / 3 = 86px)
        const pieceSize = 86;

        currentOrder.forEach((originalIndex, slotIndex) => {
            const piece = document.createElement('div');
            piece.classList.add('puzzle-piece');

            const row = Math.floor(originalIndex / gridCols);
            const col = originalIndex % gridCols;

            piece.style.backgroundPosition = `-${col * pieceSize}px -${row * pieceSize}px`;

            if (selectedPieceIndex === slotIndex) {
                piece.classList.add('selected');
            }

            piece.addEventListener('click', () => handlePieceClick(slotIndex));
            puzzleContainer.appendChild(piece);
        });
    }

    // 3. Klik & Tukar
    function handlePieceClick(slotIndex) {
        if (isSolved) return;

        if (selectedPieceIndex === null) {
            selectedPieceIndex = slotIndex;
            renderPuzzle();
        } else if (selectedPieceIndex === slotIndex) {
            selectedPieceIndex = null;
            renderPuzzle();
        } else {
            const firstIndex = selectedPieceIndex;
            const secondIndex = slotIndex;

            [currentOrder[firstIndex], currentOrder[secondIndex]] = [currentOrder[secondIndex], currentOrder[firstIndex]];
            selectedPieceIndex = null;
            renderPuzzle();

            if (checkIsSolved()) {
                handlePuzzleSolved(false);
            }
        }
    }

    function checkIsSolved() {
        return currentOrder.every((val, index) => val === index);
    }

    function handlePuzzleSolved(isGaveUp = false) {
        isSolved = true;
        if (puzzleSuccess) puzzleSuccess.classList.remove('hide');

        if (isGaveUp && puzzleSuccess) {
            puzzleSuccess.textContent = '🤭 Yaaah menyerah! Tapi gak apa-apa, nih udah disusunin! ✨';
        }

        // Aktifkan tombol Buka Undangan
        if (startInvitationBtn) {
            startInvitationBtn.disabled = false;
            startInvitationBtn.removeAttribute('disabled');
        }
        if (giveUpBtn) giveUpBtn.classList.add('hide');
    }

    // 4. Klik Menyerah
    if (giveUpBtn) {
        giveUpBtn.addEventListener('click', () => {
            currentOrder = [0, 1, 2, 3, 4, 5, 6, 7, 8];
            renderPuzzle();
            handlePuzzleSolved(true);
        });
    }

    // 5. Klik Buka Undangan (Pindah Ke Kartu Utama)
    if (startInvitationBtn) {
        startInvitationBtn.addEventListener('click', () => {
            // Putar musik
            if (!musicPlaying) {
                backgroundMusic.play().catch(() => { });
                musicPlaying = true;
                musicButton.textContent = "🔊 Musik ON";
                musicButton.classList.add("playing");
            }

            // Sembunyikan Puzzle Card secara total
            puzzleCard.classList.remove('show', 'active');
            puzzleCard.style.display = "none";

            // Tampilkan First Card
            firstCard.classList.add('show', 'active');
        });
    }

    initPuzzle();
});
/* ============================= */
/* GLOBAL VARIABLES & SESSION STORAGE HELPERS */
/* ============================= */

let selectedChoice = "";
let selectedDetail = "";
let musicPlaying = false;

// Fungsi menyimpan state aplikasi ke sessionStorage
function saveState(cardId) {
    const appState = {
        activeCard: cardId,
        selectedChoice: selectedChoice,
        selectedDetail: selectedDetail,
        dateInput: dateInput.value,
        timeInput: timeInput.value,
        confirmActivityText: confirmActivity.textContent,
        confirmDateText: confirmDate.textContent,
        confirmTimeText: confirmTime.textContent,
        finalActivityText: finalActivity.textContent,
        finalDateText: finalDate.textContent,
        finalTimeText: finalTime.textContent
    };
    sessionStorage.setItem("invitationState", JSON.stringify(appState));
}

// Fungsi memuat state dari sessionStorage saat halaman dimuat/di-refresh
function restoreState() {
    const savedState = sessionStorage.getItem("invitationState");
    if (!savedState) return;

    try {
        const appState = JSON.parse(savedState);

        selectedChoice = appState.selectedChoice || "";
        selectedDetail = appState.selectedDetail || "";

        if (appState.dateInput) dateInput.value = appState.dateInput;
        if (appState.timeInput) timeInput.value = appState.timeInput;

        if (appState.confirmActivityText) confirmActivity.textContent = appState.confirmActivityText;
        if (appState.confirmDateText) confirmDate.textContent = appState.confirmDateText;
        if (appState.confirmTimeText) confirmTime.textContent = appState.confirmTimeText;

        if (appState.finalActivityText) finalActivity.textContent = appState.finalActivityText;
        if (appState.finalDateText) finalDate.textContent = appState.finalDateText;
        if (appState.finalTimeText) finalTime.textContent = appState.finalTimeText;

        if (appState.activeCard && appState.activeCard !== "firstCard") {
            // Sembunyikan kartu pertama
            firstCard.classList.remove("show");
            firstCard.style.display = "none";

            // Jika kartu aktif adalah detailCard atau responseCard, render tampilannya terlebih dahulu
            if (appState.activeCard === "detailCard" && selectedChoice && detailConfig[selectedChoice]) {
                showDetailChoices(detailConfig[selectedChoice]);
            } else if (appState.activeCard === "responseCard" && selectedChoice && detailConfig[selectedChoice]) {
                const config = detailConfig[selectedChoice];
                responseIcon.textContent = config.responseIcon;
                responseTitle.textContent = config.responseTitle(selectedDetail);
                responseText.innerHTML = config.responseText(selectedDetail);
            }

            // Tampilkan kartu aktif
            const activeElement = document.getElementById(appState.activeCard);
            if (activeElement) {
                activeElement.style.display = "";
                activeElement.classList.add("show");
            }
        }
    } catch (e) {
        console.error("Gagal memuat state dari sessionStorage", e);
    }
}


/* ============================= */
/* CARD 1 */
/* ============================= */

const openButton = document.getElementById("openButton");
const firstCard = document.getElementById("firstCard");
const secondCard = document.getElementById("secondCard");

openButton.addEventListener("click", function () {
    firstCard.classList.add("hide");

    setTimeout(function () {
        firstCard.style.display = "none";
        secondCard.classList.add("show");
        saveState("secondCard");
    }, 600);
});


/* ============================= */
/* CARD 2 */
/* ============================= */

const chooseButton = document.getElementById("chooseButton");
const choiceCard = document.getElementById("choiceCard");

chooseButton.addEventListener("click", function () {
    secondCard.classList.remove("show");
    secondCard.style.display = "none";
    choiceCard.classList.add("show");
    saveState("choiceCard");
});


/* ============================= */
/* CHOICE */
/* ============================= */

const choiceButtons = document.querySelectorAll(".choice-button");
const responseCard = document.getElementById("responseCard");
const responseIcon = document.getElementById("responseIcon");
const responseTitle = document.getElementById("responseTitle");
const responseText = document.getElementById("responseText");
const continueButton = document.getElementById("continueButton");
const detailCard = document.getElementById("detailCard");
const detailIcon = document.getElementById("detailIcon");
const detailTitle = document.getElementById("detailTitle");
const detailDescription = document.getElementById("detailDescription");
const detailChoices = document.getElementById("detailChoices");
const customChoice = document.getElementById("customChoice");
const customInput = document.getElementById("customInput");
const customButton = document.getElementById("customButton");
const detailContinueButton = document.getElementById("detailContinueButton");


/* ============================= */
/* KONFIGURASI PILIHAN DETAIL */
/* ============================= */

const detailConfig = {
    "Makan 🍜": {
        icon: "🍜",
        title: "Mau makan apa, Riva? 👀",
        description: "Pilih makanan yang kamu mau.<br>Kalau nggak ada, boleh tulis sendiri. 😎",
        items: ["🍜 Bakso", "🍗 Ayam Geprek", "🍚 Nasi Goreng", "🍝 Mie Gacoan", "😋 Jajan Di indomaret"],
        responseIcon: "🍜",
        responseTitle: function (detail) {
            return "Makan " + detail + "? 👀";
        },
        responseText: function (detail) {
            return "Oke, sudah dicatat.<br><br>Berarti kita makan " + detail + ". 😎";
        }
    },
    "Nongkrong ☕": {
        icon: "☕",
        title: "Nongkrongnya di mana, Riva? 👀",
        description: "Pilih tempat yang kamu suka.<br>Kalau nggak ada, boleh tulis sendiri. 😎",
        items: ["☕ Coffee shop", "🍡 Angkringan", "🏞️ Taman", "🏬 Mall / food court", "🏠 Tempat santai aja"],
        responseIcon: "☕",
        responseTitle: function (detail) {
            return "Nongkrong di " + detail + "? ☕";
        },
        responseText: function (detail) {
            return "Sip, dicatat.<br><br>Kita nongkrong di " + detail + ".<br>Semoga obrolannya nggak garing. 😎";
        }
    },
    "Nonton 🎬": {
        icon: "🎬",
        title: "Nonton apa, Riva? 👀",
        description: "Pilih genre yang kamu suka.<br>Kalau nggak ada, boleh tulis sendiri. 😎",
        items: ["😂 Komedi", "😱 Horror", "❤️ Romance", "💥 Action", "🕵️ Thriller / Misteri"],
        responseIcon: "🎬",
        responseTitle: function (detail) {
            return "Nonton " + detail + "? 🎬";
        },
        responseText: function (detail) {
            return "Sip, dicatat.<br><br>Kita nonton genre " + detail + ".<br>Semoga nggak ada yang nangis pas nonton. 😭";
        }
    },
    "Jalan-jalan 🌳": {
        icon: "🌳",
        title: "Jalan-jalan ke mana, Riva? 👀",
        description: "Pilih suasana yang kamu mau.<br>Kalau nggak ada, boleh tulis sendiri. 😎",
        items: ["🏞️ Taman / alam terbuka", "🏙️ Sekitar kota", "🏖️ Pantai", "⛰️ Pegunungan / sejuk", "📸 Spot foto-foto"],
        responseIcon: "🌳",
        responseTitle: function (detail) {
            return "Jalan-jalan ke " + detail + "? 🌳";
        },
        responseText: function (detail) {
            return "Oke, dicatat.<br><br>Kita jalan-jalan ke " + detail + ".<br>Semoga kaki Riva kuat ya. 😭";
        }
    },
    "Main 🎮": {
        icon: "🎮",
        title: "Mau main apa, Riva? 👀",
        description: "Pilih permainan yang kamu mau.<br>Kalau nggak ada, boleh tulis sendiri. 😎",
        items: ["🎮 PS / Console", "Bowling", "🎱 Billiard", "🕹️ Arcade", "🎲 Board game"],
        responseIcon: "🎮",
        responseTitle: function (detail) {
            return "Main " + detail + "? 🎮";
        },
        responseText: function (detail) {
            return "Oke, gas.<br><br>Kita main " + detail + ".<br>Siap-siap kalah ya. 😏";
        }
    },
    "Terserah kamu 🎲": {
        icon: "🎲",
        title: "Terserah, tapi ada bocoran nggak? 👀",
        description: "Nggak usah tentuin tempat atau aktivitasnya,<br>cukup kasih tau maunya yang kayak gimana. 😎",
        items: ["🎉 Yang rame", "😌 Yang santai", "💸 Yang murah meriah", "✨ Yang beda dari biasanya", "🤷 Beneran terserah"],
        responseIcon: "🎲",
        responseTitle: function (detail) {
            return "Oke, yang " + detail + "! 😎";
        },
        responseText: function (detail) {
            return "Sip, dicatat.<br><br>Nanti radly yang cariin tempat/aktivitasnya,<br>yang penting " + detail + ". 😎";
        }
    }
};


/* ============================= */
/* TAMPILKAN DETAIL CARD */
/* ============================= */

function showDetailChoices(config) {
    detailIcon.textContent = config.icon;
    detailTitle.textContent = config.title;
    detailDescription.innerHTML = config.description;
    detailChoices.innerHTML = "";
    customChoice.classList.remove("show");
    customInput.value = "";

    config.items.forEach(function (item) {
        const button = document.createElement("button");
        button.classList.add("detail-choice-button");
        button.textContent = item;

        if (selectedDetail === item) {
            button.classList.add("selected");
        }

        button.addEventListener("click", function () {
            document.querySelectorAll(".detail-choice-button").forEach(function (el) {
                el.classList.remove("selected");
            });

            button.classList.add("selected");
            customChoice.classList.remove("show");
            selectedDetail = item;
        });

        detailChoices.appendChild(button);
    });

    const customChoiceButton = document.createElement("button");
    customChoiceButton.classList.add("detail-choice-button");
    customChoiceButton.textContent = "✍️ Tulis sendiri";

    if (selectedDetail && !config.items.includes(selectedDetail)) {
        customChoiceButton.classList.add("selected");
        customChoice.classList.add("show");
        customInput.value = selectedDetail;
    }

    customChoiceButton.addEventListener("click", function () {
        document.querySelectorAll(".detail-choice-button").forEach(function (el) {
            el.classList.remove("selected");
        });

        customChoiceButton.classList.add("selected");
        selectedDetail = "";
        customChoice.classList.add("show");
        customInput.focus();
    });

    detailChoices.appendChild(customChoiceButton);
}

function playChoiceSound() {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;

    const audioContext = new AudioContext();
    const oscillator = audioContext.createOscillator();
    const gain = audioContext.createGain();

    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(520, audioContext.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(760, audioContext.currentTime + 0.12);

    gain.gain.setValueAtTime(0.0001, audioContext.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.12, audioContext.currentTime + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, audioContext.currentTime + 0.14);

    oscillator.connect(gain);
    gain.connect(audioContext.destination);

    oscillator.start();
    oscillator.stop(audioContext.currentTime + 0.15);

    setTimeout(function () {
        audioContext.close();
    }, 300);
}

function createChoiceEffect(button) {
    const effects = ["✨", "💕", "💗", "✨", "❤️"];

    for (let i = 0; i < 5; i++) {
        const effect = document.createElement("span");
        effect.classList.add("choice-effect");
        effect.textContent = effects[Math.floor(Math.random() * effects.length)];
        effect.style.left = "50%";
        effect.style.top = "50%";

        const moveX = (Math.random() * 100 - 50) + "px";
        const moveY = (Math.random() * 100 - 50) + "px";

        effect.style.setProperty("--move-x", moveX);
        effect.style.setProperty("--move-y", moveY);

        button.appendChild(effect);

        setTimeout(function () {
            effect.remove();
        }, 800);
    }
}

/* ============================= */
/* CUSTOM CHOICE BUTTON */
/* ============================= */

customButton.addEventListener("click", function () {
    const value = customInput.value.trim();

    if (value === "") {
        alert("Tulis dulu pilihanmu, Riva 😭");
        return;
    }

    selectedDetail = value;

    document.querySelectorAll(".detail-choice-button").forEach(function (el) {
        if (el.textContent.indexOf("Tulis sendiri") !== -1) {
            el.classList.add("selected");
        } else {
            el.classList.remove("selected");
        }
    });

    const originalText = customButton.textContent;
    customButton.textContent = "✅ Tersimpan!";
    customButton.disabled = true;

    setTimeout(function () {
        customButton.textContent = originalText;
        customButton.disabled = false;
    }, 1200);

    customInput.blur();
});

/* ============================= */
/* CHOICE BUTTON EVENT */
/* ============================= */

choiceButtons.forEach(function (button) {
    button.addEventListener("click", function () {
        playChoiceSound();

        choiceButtons.forEach(function (item) {
            item.classList.remove("selected");
        });

        button.classList.add("selected");
        createChoiceEffect(button);

        selectedChoice = button.dataset.choice;

        choiceCard.style.display = "none";
        choiceCard.classList.remove("show");

        showDetailChoices(detailConfig[selectedChoice]);

        detailCard.classList.add("show");
        saveState("detailCard");
    });
});

/* ============================= */
/* DETAIL CONTINUE */
/* ============================= */

detailContinueButton.addEventListener("click", function () {
    if (selectedDetail === "") {
        alert("Riva, pilih salah satu dulu ya 😭");
        return;
    }

    detailCard.classList.remove("show");
    detailCard.style.display = "none";

    const config = detailConfig[selectedChoice];
    responseIcon.textContent = config.responseIcon;
    responseTitle.textContent = config.responseTitle(selectedDetail);
    responseText.innerHTML = config.responseText(selectedDetail);

    responseCard.classList.add("show");
    saveState("responseCard");
});


/* ============================= */
/* DATE & TIME */
/* ============================= */

const dateCard = document.getElementById("dateCard");
const dateContinueButton = document.getElementById("dateContinueButton");
const dateInput = document.getElementById("dateInput");
const timeInput = document.getElementById("timeInput");

continueButton.addEventListener("click", function () {
    responseCard.classList.remove("show");
    responseCard.style.display = "none";

    dateCard.classList.add("show");
    saveState("dateCard");
});


/* ============================= */
/* CONFIRMATION */
/* ============================= */

const confirmationCard = document.getElementById("confirmationCard");
const confirmActivity = document.getElementById("confirmActivity");
const confirmDate = document.getElementById("confirmDate");
const confirmTime = document.getElementById("confirmTime");
const finalButton = document.getElementById("finalButton");

dateContinueButton.addEventListener("click", function () {
    if (dateInput.value === "") {
        alert("Riva, tanggalnya belum dipilih 😭");
        return;
    }

    if (timeInput.value === "") {
        alert("Jamnya juga belum dipilih 😭");
        return;
    }

    const date = new Date(dateInput.value + "T00:00:00");
    const formattedDate = date.toLocaleDateString("id-ID", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric"
    });

    confirmActivity.textContent =
        detailConfig[selectedChoice] && selectedDetail !== ""
            ? selectedChoice + " (" + selectedDetail + ")"
            : selectedChoice;

    confirmDate.textContent = formattedDate;
    confirmTime.textContent = timeInput.value;

    dateCard.classList.remove("show");
    dateCard.style.display = "none";

    confirmationCard.classList.add("show");
    saveState("confirmationCard");
});


/* ============================= */
/* FINAL CARD */
/* ============================= */

const finalCard = document.getElementById("finalCard");
const messageCard = document.getElementById("messageCard");
const finalActivity = document.getElementById("finalActivity");
const finalDate = document.getElementById("finalDate");
const finalTime = document.getElementById("finalTime");

finalButton.addEventListener("click", function () {
    finalActivity.textContent = confirmActivity.textContent;
    finalDate.textContent = confirmDate.textContent;
    finalTime.textContent = confirmTime.textContent;

    confirmationCard.classList.remove("show");
    confirmationCard.style.display = "none";

    finalCard.classList.add("show");
    saveState("finalCard");

    createConfetti();
});


/* ============================= */
/* CONFETTI */
/* ============================= */

function createConfetti() {
    const confettiCount = 80;

    for (let i = 0; i < confettiCount; i++) {
        const confetti = document.createElement("div");
        confetti.classList.add("confetti");
        confetti.textContent = ["❤️", "💕", "💗", "✨", "🎉"][Math.floor(Math.random() * 5)];
        confetti.style.left = Math.random() * 100 + "vw";
        confetti.style.animationDelay = Math.random() * 2 + "s";
        confetti.style.fontSize = Math.random() * 15 + 10 + "px";

        document.body.appendChild(confetti);

        setTimeout(function () {
            confetti.remove();
        }, 5000);
    }
}


/* ============================= */
/* BACKGROUND MUSIC */
/* ============================= */

const backgroundMusic = document.getElementById("backgroundMusic");
const musicButton = document.getElementById("musicButton");

musicButton.addEventListener("click", function () {
    if (!musicPlaying) {
        backgroundMusic.play().catch(() => { });
        musicPlaying = true;
        musicButton.textContent = "🔊 Musik ON";
        musicButton.classList.add("playing");
    } else {
        backgroundMusic.pause();
        musicPlaying = false;
        musicButton.textContent = "🎵 Musik";
        musicButton.classList.remove("playing");
    }
});


/* ============================= */
/* PERSONAL MESSAGE */
/* ============================= */

const messageButton = document.getElementById("messageButton");

messageButton.addEventListener("click", function () {
    finalCard.classList.remove("show");
    finalCard.style.display = "none";

    messageCard.classList.add("show");
    saveState("messageCard");
});


/* ============================= */
/* BAGIKAN KE WHATSAPP */
/* ============================= */

const shareButton = document.getElementById("shareButton");
const whatsappNumber = "6281244533799";

shareButton.addEventListener("click", function () {
    const message =
        "Hai Radly! 😳" +
        "\n\n" +
        "Aku udah pilih nih, gas yuk!" +
        "\n\n" +
        "📍 " + finalActivity.textContent +
        "\n" +
        "📅 " + finalDate.textContent +
        "\n" +
        "⏰ " + finalTime.textContent +
        "\n\n" +
        "❤️";

    const waUrl =
        "https://wa.me/" +
        whatsappNumber +
        "?text=" +
        encodeURIComponent(message);

    window.open(waUrl, "_blank");
});


/* ============================= */
/* RUNAWAY BUTTON (NO BUTTON) */
/* ============================= */

const noButton = document.getElementById("noButton");

const noButtonTexts = [
    "Gak mau jalan 😭",
    "Yakin? 👀",
    "Jangan pencet itu 😭",
    "Eh jangan 😭",
    "Kok ngejar sih 😭",
    "Riva curang 😭",
    "Masih ngejar? 😭",
    "Aku kabur dulu 🏃‍♂️💨",
    "Nggak boleh nolak 😤"
];

let noButtonCount = 0;
let noButtonSurrendered = false;

function moveNoButton() {

    if (noButtonSurrendered) return;

    noButton.classList.remove("panik");
    noButton.classList.remove("running");

    void noButton.offsetWidth;

    noButton.classList.add("panik");
    noButton.classList.add("running");

    noButtonCount++;

    /* ============================= */
    /* SETELAH 8X → TOMBOL MENYERAH */
    /* ============================= */

    if (noButtonCount >= 8) {

        noButtonSurrendered = true;

        noButton.classList.remove("panik");
        noButton.classList.remove("running");

        noButton.textContent = "Yaudah deh, jalan 😭❤️";

        noButton.style.position = "relative";
        noButton.style.left = "auto";
        noButton.style.top = "auto";

        noButton.style.background =
            "linear-gradient(135deg, #b94f7b, #8e3157)";

        noButton.style.color = "#ffffff";

        noButton.style.border = "none";

        noButton.style.boxShadow =
            "0 10px 25px rgba(142,49,87,0.25)";

        return;
    }

    noButton.textContent = noButtonTexts[noButtonCount];

    const buttonWidth = noButton.offsetWidth;
    const buttonHeight = noButton.offsetHeight;

    const cardRect = secondCard.getBoundingClientRect();

    const padding = 20;

    const minX = cardRect.left + padding;
    const maxX = cardRect.right - buttonWidth - padding;

    const minY = cardRect.top + padding;
    const maxY = cardRect.bottom - buttonHeight - padding;

    const randomX =
        minX + Math.random() * Math.max(0, maxX - minX);

    const randomY =
        minY + Math.random() * Math.max(0, maxY - minY);

    noButton.style.left = randomX + "px";
    noButton.style.top = randomY + "px";
}


/* ============================= */
/* DESKTOP */
/* ============================= */

noButton.addEventListener("mouseenter", function () {

    if (!noButtonSurrendered) {
        moveNoButton();
    }

});


/* ============================= */
/* CLICK */
/* ============================= */

noButton.addEventListener("click", function (event) {

    event.preventDefault();

    /* Kalau sudah menyerah */
    if (noButtonSurrendered) {

        secondCard.classList.remove("show");
        secondCard.style.display = "none";

        choiceCard.classList.add("show");

        saveState("choiceCard");

        return;
    }

    moveNoButton();

});


/* ============================= */
/* MOBILE TOUCH */
/* ============================= */

noButton.addEventListener("touchstart", function (event) {

    /*
     * Kalau tombol sudah menjadi
     * "Yaudah deh, jalan",
     * jangan cegah click.
     */

    if (noButtonSurrendered) {
        return;
    }

    event.preventDefault();

    moveNoButton();

}, { passive: false });


/* ============================= */
/* INITIALIZATION */
/* ============================= */

document.addEventListener("DOMContentLoaded", function () {
    restoreState();
});