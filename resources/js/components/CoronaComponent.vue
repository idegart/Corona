<template>
    <v-app>
        <v-content>
            <v-container>
                <v-row>
                    <v-col>
                        <v-card>
                            <v-card-title>Симуляция заражения</v-card-title>

                            <v-divider></v-divider>

                            <div id="corona-simulation"></div>

                            <corona-form ref="form" />

                            <v-card-actions>
                                <v-btn @click="startSimulation" color="orange" text>
                                    Начать симуляцию
                                </v-btn>

                                <v-btn v-if="lastParams" @click="openLastModal" color="orange" text>
                                    Прошлая статистика
                                </v-btn>
                            </v-card-actions>

                        </v-card>


                    </v-col>
                </v-row>
            </v-container>
        </v-content>
        <v-footer app>
            <span class="orange--text">&copy; 2020</span>
            <v-spacer/>
            <v-icon color="orange">fas fa-viruses</v-icon>
        </v-footer>

        <corona-modal :params="endParams" @close="onClose" @open="onOpen" />

    </v-app>
</template>

<script>
    import bridge from '@vkontakte/vk-bridge';

    import CoronaForm from "@component/Corona/CoronaForm";
    import Simulator from "@plugin/coronaSimulation";
    import CoronaModal from "@component/Corona/CoronaModal";

    let simulator;

    export default {
        name: "CoronaComponent",

        components: {CoronaModal, CoronaForm},

        data: () => ({
            lastParams: null,
            endParams: null,

            firstStart: false,
        }),

        methods: {
            startSimulation () {
                this.$vuetify.goTo(0)

                if (simulator) {
                    simulator.game.destroy()
                }

                let root = document.getElementById('corona-simulation')
                root.innerHTML = '';

                let sceneConfig = this.$refs.form.getConfigs()

                simulator = new Simulator({
                    gameConfig: {
                        parent: root,
                        width: root.offsetWidth,
                        height: 500,
                    },
                    sceneConfig: {...sceneConfig, onGameEnd: this.onGameEnd}
                })
            },

            onGameEnd (params) {
                this.endParams = {...params}
                this.lastParams = {...params}
            },

            onClose () {
                this.endParams = null
                console.log('closed')
            },

            onOpen () {
                console.log('opened')
            },

            openLastModal () {
                this.endParams = {...this.lastParams}
            },
        },

        mounted() {
            bridge.send("VKWebAppInit", {});
            this.startSimulation()
        }
    }
</script>

<style scoped>

</style>
