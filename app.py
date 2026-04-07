from flask import Flask, render_template, request, jsonify
import random

app = Flask(__name__)

wins = 0
losses = 0
ties = 0
streak = 0
best_streak = 0
history = []
match_mode = 5
match_wins = 0
match_losses = 0
match_over = False

TAUNTS = [
    "Too slow! 😈",
    "Is that all you got?",
    "Predictable. Try again.",
    "I literally saw that coming.",
    "Maybe stick to tic-tac-toe 😂",
    "skill issue ngl",
    "L + ratio + computer wins",
    "You sure you wanna keep going? 💀",
]


@app.route("/")
def home():
    return render_template("rps.html")


@app.route("/play", methods=["POST"])
def play():
    global wins, losses, ties, streak, best_streak, history
    global match_wins, match_losses, match_over

    if match_over:
        return jsonify({"match_over": True})

    data = request.get_json()
    user_choice = data["choice"]
    choices = ["R", "P", "S"]
    computer_choice = random.choice(choices)

    names = {"R": "Rock", "P": "Paper", "S": "Scissors"}
    emojis = {"R": "🪨", "P": "📄", "S": "✂️"}

    if user_choice == computer_choice:
        result = "tie"
        message = "It's a Tie!"
        taunt = ""
        ties += 1
        streak = 0

    elif (
        (user_choice == "R" and computer_choice == "S")
        or (user_choice == "S" and computer_choice == "P")
        or (user_choice == "P" and computer_choice == "R")
    ):
        result = "win"
        message = "You Win! 🎉"
        taunt = ""
        wins += 1
        streak += 1
        match_wins += 1
        if streak > best_streak:
            best_streak = streak
    else:
        result = "lose"
        message = "Computer Wins!"
        taunt = random.choice(TAUNTS)
        losses += 1
        streak = 0
        match_losses += 1

    wins_needed = 2 if match_mode == 3 else 3
    match_winner = None
    if match_wins >= wins_needed:
        match_over = True
        match_winner = "player"
    elif match_losses >= wins_needed:
        match_over = True
        match_winner = "computer"

    history.append(
        {"user": emojis[user_choice], "cpu": emojis[computer_choice], "result": result}
    )
    if len(history) > 5:
        history.pop(0)

    return jsonify(
        {
            "user_choice": names[user_choice],
            "user_emoji": emojis[user_choice],
            "computer_choice": names[computer_choice],
            "computer_emoji": emojis[computer_choice],
            "result": result,
            "message": message,
            "taunt": taunt,
            "wins": wins,
            "losses": losses,
            "ties": ties,
            "streak": streak,
            "best_streak": best_streak,
            "history": history,
            "match_wins": match_wins,
            "match_losses": match_losses,
            "match_over": match_over,
            "match_winner": match_winner,
            "match_mode": match_mode,
        }
    )


@app.route("/set_mode", methods=["POST"])
def set_mode():
    global match_mode
    data = request.get_json()
    match_mode = int(data["mode"])
    return jsonify({"mode": match_mode})


@app.route("/reset", methods=["POST"])
def reset():
    global wins, losses, ties, streak, best_streak, history
    global match_wins, match_losses, match_over
    wins = losses = ties = streak = match_wins = match_losses = 0
    best_streak = 0
    history = []
    match_over = False
    return jsonify({"status": "reset"})


if __name__ == "__main__":
    app.run(debug=True)
