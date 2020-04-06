<template>
    <v-dialog v-model="dialog" fullscreen hide-overlay transition="dialog-bottom-transition">
        <v-card v-if="params">
            <v-toolbar dark color="primary">
                <v-btn icon dark @click="dialog = false">
                    <v-icon>fas fa-times-circle</v-icon>
                </v-btn>
                <v-toolbar-title>Статистика симуляции</v-toolbar-title>
                <v-spacer></v-spacer>
            </v-toolbar>

            <v-list-item>
                <v-list-item-icon>
                    <v-icon>fas fa-align-center</v-icon>
                </v-list-item-icon>
                <v-list-item-title>Заразил в среднем</v-list-item-title>
                <v-list-item-subtitle>{{ params.avg }}</v-list-item-subtitle>
            </v-list-item>

            <v-list-item>
                <v-list-item-icon>
                    <v-icon>fas fa-sort-numeric-up-alt</v-icon>
                </v-list-item-icon>
                <v-list-item-title>Заразил максимально</v-list-item-title>
                <v-list-item-subtitle>{{ params.max }}</v-list-item-subtitle>
            </v-list-item>

            <v-list-item>
                <v-list-item-icon>
                    <v-icon>fas fa-equals</v-icon>
                </v-list-item-icon>
                <v-list-item-title>Результат</v-list-item-title>
                <v-list-item-subtitle>{{ normalResult }}</v-list-item-subtitle>
            </v-list-item>

            <v-divider></v-divider>
            <v-subheader>Графики</v-subheader>

            <v-list-item>
                <v-list-item-content>
                    <corona-chart :chartData="data" :options="chartOptions" />
                </v-list-item-content>
            </v-list-item>
        </v-card>
    </v-dialog>
</template>

<script>
    import {times} from 'lodash'
    import {END_NO_MOVEABLE, END_NO_HEALTHY, END_NO_INFECTED} from "@plugin/coronaSimulation";
    import CoronaChart from "@component/Corona/CoronaChart";

    export default {
        name: "CoronaModal",
        components: {CoronaChart},
        props: {
            params: {
                type: Object|null,
                required: true
            }
        },

        data: () => ({
            dialog: false,
            data: null,

            chartOptions: {
                ticks: {
                    precision: 100
                }
            }
        }),

        computed: {
            normalResult () {
                switch (this.params.reason) {
                    case END_NO_MOVEABLE: return 'Нет распространения';
                    case END_NO_HEALTHY: return 'Нет здоровых';
                    case END_NO_INFECTED: return 'Нет зараженных'
                }
                return ''
            },
        },

        watch: {
            params: {
                handler (value) {
                    this.dialog = !! value
                },
                deep: true,
            },
            dialog (value) {
                this.$emit(value ? 'open' : 'close');

                if (value) {
                    this.fillData()
                }
            }
        },

        methods: {
            fillData () {
                this.data = {
                    labels: this.getLabels(),
                    datasets: [
                        {
                            label: 'Здоровы',
                            borderColor: 'green',
                            data: this.getHealthyData()
                        }, {
                            label: 'Инфицированы',
                            borderColor: 'yellow',
                            data: this.getWarnData()
                        }, {
                            label: 'Больны',
                            borderColor: 'red',
                            data: this.getBadData()
                        }
                    ]
                }
            },

            getLabels () {
                return times(this.params.stats.length, n => n * 2)
            },

            getHealthyData () {
                return this.params.stats.map(s => s.healthy)
            },

            getWarnData () {
                return this.params.stats.map(s => s.warn)
            },

            getBadData () {
                return this.params.stats.map(s => s.bad)
            }
        },
    }
</script>

<style scoped>

</style>
