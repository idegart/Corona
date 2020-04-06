import Phaser from 'phaser'
import {merge, times, random, get} from 'lodash'

const CLEAR_PERSON = 0xffffff;
const BAD_PERSON = 0xff0000;
const WARN_PERSON = 0xffff00;

const CLEAR_PERSON_TINTED = CLEAR_PERSON;
const BAD_PERSON_TINTED = 255;
const WARN_PERSON_TINTED = 65535;

const STAT_DELAY = 200;

const END_NO_HEALTHY = 'END_NO_HEALTHY';
const END_NO_MOVEABLE = 'END_NO_MOVEABLE';
const END_NO_INFECTED = 'END_NO_INFECTED';

export {END_NO_HEALTHY, END_NO_MOVEABLE, END_NO_INFECTED}

class BaseScene extends Phaser.Scene {
    constructor(config) {
        super(config);

        this.max_speed = 50;
        this.min_speed = 40;
        this.max_speed_forced = 250;

        this.total_persons = get(config, 'total_persons');
        this.infect_time = get(config, 'infect_time');
        this.shop_time = get(config, 'shop_time');
        this.stay_home_percent = get(config, 'stay_home_percent');
        this.start_infected = get(config, 'start_infected');
        this.bad_can_move = get(config, 'bad_can_move', false);
        this.infected_can_infect = get(config, 'infected_can_infect', false);
        this.infect_percent = get(config, 'infect_percent');
        this.remove_bad = get(config, 'remove_bad', false);

        this.has_shop = get(config, 'has_shop', false);
        this.infectable_shop = get(config, 'infectable_shop', false);
        this.shop_go_only_moveable = get(config, 'shop_go_only_moveable', false);

        this.infected_shop = false;

        this.onGameEnd = config.onGameEnd;

        this.stats = []
    }


    create () {
        this.physics.world.setBoundsCollision(true, true, true, true);

        this.createPersonTexture();

        this.persons = this.physics.add.group({
            key: 'person',
            frameQuantity: this.total_persons,
            collideWorldBounds: true,
            immovable: true,
        });

        Phaser.Actions.RandomRectangle(this.persons.getChildren(), this.physics.world.bounds);

        let homes = Math.floor(this.total_persons - this.total_persons / 100 * this.stay_home_percent);

        times(homes, n => {
            this.setRandomVelocity(this.persons.getChildren()[n])
        });

        times(this.start_infected, () => {
            this.infectPerson(this.persons.getChildren()[this.getRandomPersonIndex()], true)
        });

        this.physics.add.collider(
            this.persons,
            undefined,
            (p1, p2) => {
                this.checkForIllness(p1, p2);
                this.checkForIllness(p2, p1)
            }
        );

        if (this.has_shop) {
            this.createShop();
        }

        this.checkStats()
    }

    getRandomPersonIndex() {
        return random(0, this.total_persons - 1)
    }


    update(time, delta) {
        if (this.persons.getChildren().every(p => p.tintTopLeft === BAD_PERSON_TINTED)) {
            this.endGame(END_NO_HEALTHY)
        }

        let visiblePersons = this.persons.getChildren().filter(p => p.visible);

        if (visiblePersons.every(p => p.tintTopLeft === CLEAR_PERSON_TINTED)) {
            this.endGame(END_NO_INFECTED)
        }

        if (visiblePersons.every(p => p.body.immovable)) {
            this.endGame(END_NO_MOVEABLE)
        }

        this.persons.getChildren().filter(p => p.moved_to_shop).forEach(p => {
            this.physics.moveToObject(p, this.shop, this.max_speed_forced);
        });

        this.persons.getChildren().filter(p => p.moved_to_home).forEach(p => {
            if (Phaser.Math.Distance.Between(p.body.position.x, p.body.position.y, p.prev_x, p.prev_y) < 10) {
                p.moved_to_home = false;
                this.setRandomVelocity(p)
            } else {
                this.physics.moveTo(p, p.prev_x, p.prev_y, this.max_speed_forced)
            }
        })

    }

    createPersonTexture () {
        let circle = new Phaser.Geom.Circle(2, 2, 2);
        this.personGraphics = this.make.graphics({ fillStyle: { border: CLEAR_PERSON }, });
        this.personGraphics.fillCircleShape(circle);
        this.personGraphics.generateTexture('person', 4, 4)
    }

    createShop () {
        this.shop = this.add.zone(this.game.config.width / 2, this.game.config.height / 2, 10, 10);
        this.physics.world.enable(this.shop);
        this.shop.body.setAllowGravity(false);
        this.shop.body.moves = false;

        let circle = new Phaser.Geom.Circle(16, 16, 15);
        this.personGraphics = this.make.graphics({ lineStyle: { width: 2, color: 0xffffff }, });
        this.personGraphics.strokeCircleShape(circle);
        this.personGraphics.generateTexture('shop', 34, 34);

        this.shopLabel = this.add.sprite(this.game.config.width / 2, this.game.config.height / 2, 'shop');

        this.shopLabel.setTint(0x00ff00);

        this.createShopScripts()
    }

    createShopScripts () {
        this.time.addEvent({ delay: this.shop_time, callback: () => {
            let randPerson, moveablePersons;

            if (this.shop_go_only_moveable) {
                moveablePersons = this.persons.getChildren().filter(p => !p.body.immovable);
            } else {
                moveablePersons = this.persons.getChildren()
            }

            if (!moveablePersons.length) {
                return;
            }

            if (!this.bad_can_move) {
                let filtered = moveablePersons.filter(p => p.tintTopLeft !== BAD_PERSON_TINTED);
                randPerson = filtered[random(0, filtered.length - 1)];
            } else {
                randPerson = moveablePersons[random(0, moveablePersons.length - 1)];
            }

            if (!randPerson) {
                return
            }

            randPerson.moved_to_shop = true;
            randPerson.moved_to_home = false;
            randPerson.prev_x = randPerson.body.position.x;
            randPerson.prev_y = randPerson.body.position.y;
            randPerson.body.setMaxSpeed(this.max_speed_forced)
        }, loop: true });

        this.physics.add.overlap(
            this.persons,
            this.shop,
            (z, p) => {
                if (this.isInfected(p)) {
                    this.infected_shop = true;
                    this.shopLabel.setTint(0xff0000)
                }

                if (p.moved_to_shop) {
                    p.moved_to_shop = false;
                    p.moved_to_home = true
                }

                if (this.infectable_shop && this.infected_shop && this.canBeInfected(p)) {
                    this.infectPerson(p)
                }
            }
        )
    }

    checkStats () {
        this.time.addEvent({ delay: STAT_DELAY, callback: () => {
            let healthy = 0;
            let warn = 0;
            let bad = 0;

            this.persons.getChildren()
                .forEach(p => {
                    switch (p.tintTopLeft) {
                    case CLEAR_PERSON_TINTED: healthy++; break;
                    case WARN_PERSON_TINTED: warn++; break;
                    case BAD_PERSON_TINTED: bad++; break
                }});

            this.stats.push({healthy, warn, bad})
        }, loop: true });
    }

    checkForIllness (p1, p2) {
        if (!this.canBeInfected(p1)) {
            return
        }

        if (this.isInfected(p2)) {
            if (this.infectPerson(p1)) {
                if (p2.infector) {
                    p2.infector++
                } else {
                    p2.infector = 1
                }
            }
        }
    }

    canBeInfected (p) {
        return p.tintTopLeft === CLEAR_PERSON_TINTED
    }

    isInfected (p) {
        if (p.visible === false) {
            return false
        }

        if (p.tintTopLeft === CLEAR_PERSON_TINTED) {
            return false;
        }

        if (p.tintTopLeft === BAD_PERSON_TINTED) {
            return true
        }

        if (this.infected_can_infect && p.tintTopLeft === WARN_PERSON_TINTED) {
            return true
        }
    }

    infectPerson(p, force = false) {
        if (!force && Math.random() > this.infect_percent / 100) {
            return false
        }

        p.setTint(WARN_PERSON);

        this.time.addEvent({ delay: this.infect_time, callback: () => {
            if (this.remove_bad) {
                p.visible = false
            } else {
                p.setTint(BAD_PERSON);
                if (!this.bad_can_move) {
                    this.setStatic(p)
                }
            }
        }});

        return true
    }

    setRandomVelocity(p) {
        if (!this.bad_can_move) {
            if (p.tintTopLeft === BAD_PERSON_TINTED) {
                this.setStatic(p);
                return
            }
        }

        p.setVelocity(this.getRandomSpeed(), this.getRandomSpeed());
        p.body.setMaxSpeed(this.max_speed)
            .setBounce(1, 1)
            .setImmovable(false);

        if (Math.random() > 0.5) p.body.velocity.x *= -1;
        else p.body.velocity.y *= -1;
    }

    setStatic(p) {
        p.setImmovable(true).setVelocity(0,0)
    }

    getRandomSpeed () {
        return Phaser.Math.Between(this.min_speed, this.max_speed)
    }

    endGame (reason) {
        this.scene.pause();
        console.log('game end: ', reason);

        let infectors = this.persons.getChildren().filter(p => p.infector).map(p => p.infector),
            total = infectors.length,
            min = Math.min(...infectors),
            max = Math.max(...infectors),
            sum = infectors.reduce((prev, curr) => prev += curr, 0),
            avg = sum / total;

        this.onGameEnd({
            total, min, max, sum, avg,
            reason, stats: this.stats
        })
    }
}

export default class Simulator {
    constructor({gameConfig = undefined, sceneConfig = undefined}) {
        this.game = new Phaser.Game(merge(gameConfig, {
            type: Phaser.AUTO,
            scene: [ new BaseScene(sceneConfig) ],
            physics: {
                default: 'arcade',
            }
        }));
    }
}
