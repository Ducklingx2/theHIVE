export class UI {

    constructor(game) {

        this.game = game;

        this.phaseName =
            document.getElementById(
                "phase-name"
            );

        this.phaseDescription =
            document.getElementById(
                "phase-description"
            );

        this.timer =
            document.getElementById(
                "timer"
            );

        this.activeChamber =
            document.getElementById(
                "active-chamber"
            );

        this.roleName =
            document.getElementById(
                "role-name"
            );

        this.stingContainer =
            document.getElementById(
                "sting-container"
            );


        this.phaseDescriptions = {

            INTRUSION:
                "Find the Wasp.",

            ASSASSINATION:
                "The Queen must die.",

            "TRUE COLOURS":
                "The Queen is running."
        };


        this.updateActiveChamber();
    }


    setPhase(
        phase,
        time
    ) {

        if (this.phaseName) {

            this.phaseName.textContent =
                phase;
        }


        if (this.phaseDescription) {

            this.phaseDescription.textContent =
                this.phaseDescriptions[
                    phase
                ] || "";
        }


        this.updateTimer(
            time
        );
    }


    updateTimer(
        seconds
    ) {

        if (!this.timer) {
            return;
        }

        const total =
            Math.max(
                0,
                Math.floor(seconds)
            );

        const minutes =
            Math.floor(
                total / 60
            );

        const remainingSeconds =
            total % 60;

        this.timer.textContent =
            `${String(minutes).padStart(2, "0")}:${String(remainingSeconds).padStart(2, "0")}`;
    }


    update(
        player
    ) {

        this.updateActiveChamber();
    }


    updateActiveChamber() {

        if (
            !this.game.world ||
            !this.game.player
        ) {
            return;
        }


        const room =
            this.game.world.getRoomAt(
                this.game.player.group.position.x,
                this.game.player.group.position.z
            );


        if (
            room &&
            this.activeChamber
        ) {

            this.activeChamber.textContent =
                room.userData.name;
        }
        else if (this.activeChamber) {

            this.activeChamber.textContent =
                "OUTER HIVE";
        }
    }


    setRole(
        role
    ) {

        if (!this.roleName) {
            return;
        }

        this.roleName.textContent =
            role.toUpperCase();
    }


    setStings(
        amount,
        max
    ) {

        if (!this.stingContainer) {
            return;
        }

        this.stingContainer.innerHTML = "";

        for (
            let i = 0;
            i < max;
            i++
        ) {

            const sting =
                document.createElement(
                    "div"
                );

            sting.className =
                i < amount
                    ? "sting active"
                    : "sting empty";

            this.stingContainer.appendChild(
                sting
            );
        }
    }
}
