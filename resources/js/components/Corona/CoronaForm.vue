<template>
    <v-list>
        <v-list-item-group
            v-model="checkedSettings"
            multiple
        >
            <v-subheader>Публичное место</v-subheader>

            <v-list-item v-for="settings in shopSettings" :key="settings.name" :value="settings.name">
                <template v-slot:default="{ active, toggle }">
                    <v-list-item-action>
                        <v-checkbox v-model="active" @click="toggle"></v-checkbox>
                    </v-list-item-action>

                    <v-list-item-content>
                        <v-list-item-title>{{ settings.title }}</v-list-item-title>
                        <v-list-item-subtitle>{{ settings.description }}</v-list-item-subtitle>
                    </v-list-item-content>
                </template>
            </v-list-item>

            <v-divider></v-divider>

            <v-subheader>Инфекция</v-subheader>

            <v-list-item v-for="settings in badSettings" :key="settings.name" :value="settings.name">
                <template v-slot:default="{ active, toggle }">
                    <v-list-item-action>
                        <v-checkbox v-model="active" @click="toggle" :true-value="settings.name"></v-checkbox>
                    </v-list-item-action>

                    <v-list-item-content>
                        <v-list-item-title>{{ settings.title }}</v-list-item-title>
                        <v-list-item-subtitle>{{ settings.description }}</v-list-item-subtitle>
                    </v-list-item-content>
                </template>
            </v-list-item>
        </v-list-item-group>

        <v-divider></v-divider>

        <v-subheader>Основные настройки</v-subheader>

        <v-list-item>
            <v-list-item-content>
                <v-list-item-title>Население</v-list-item-title>
                <v-list-item-subtitle>Чем выше плотност население, тем быстрее распространяется вирус</v-list-item-subtitle>
                <v-slider v-model="baseConfigs.total_persons"
                          thumb-label
                          step="100"
                          ticks="always"
                          tick-size="4"
                          min="100"
                          max="3000"
                          track-color="green"
                          track-fill-color="red"
                          thumb-color="orange"
                ></v-slider>
            </v-list-item-content>
        </v-list-item>

        <v-list-item>
            <v-list-item-content>
                <v-list-item-title>Заражены изначально</v-list-item-title>
                <v-list-item-subtitle>Начальное число зараженных</v-list-item-subtitle>
                <v-slider v-model="baseConfigs.start_infected"
                          thumb-label
                          step="1"
                          ticks="always"
                          tick-size="4"
                          min="1"
                          max="10"
                          track-color="green"
                          track-fill-color="red"
                          thumb-color="orange"
                ></v-slider>
            </v-list-item-content>
        </v-list-item>

        <v-list-item>
            <v-list-item-content>
                <v-list-item-title>Вероятность заражения</v-list-item-title>
                <v-list-item-subtitle>Вероятность с которой человек заразится</v-list-item-subtitle>
                <v-slider v-model="baseConfigs.infect_percent"
                          thumb-label
                          step="5"
                          ticks="always"
                          tick-size="4"
                          min="5"
                          max="100"
                          track-color="green"
                          track-fill-color="red"
                          thumb-color="orange"
                ></v-slider>
            </v-list-item-content>
        </v-list-item>

        <v-list-item>
            <v-list-item-content>
                <v-list-item-title>Процент самоизолированных</v-list-item-title>
                <v-list-item-subtitle>Процент людей, которые останутся дома</v-list-item-subtitle>
                <v-slider v-model="baseConfigs.stay_home_percent"
                          thumb-label
                          step="5"
                          ticks="always"
                          tick-size="4"
                          min="0"
                          max="95"
                          track-color="red"
                          track-fill-color="green"
                          thumb-color="orange"
                ></v-slider>
            </v-list-item-content>
        </v-list-item>

        <v-list-item three-line>
            <v-list-item-content>
                <v-list-item-title>Частота выхода в общественное место</v-list-item-title>
                <v-list-item-subtitle>Как часто кто-либо будет идти в общественное место</v-list-item-subtitle>
                <v-list-item-subtitle>Чем меньше число, тем чаще посещяют</v-list-item-subtitle>
                <v-slider v-model="baseConfigs.shop_time"
                          thumb-label
                          step="50"
                          ticks="always"
                          tick-size="4"
                          min="0"
                          max="2000"
                          track-color="red"
                          track-fill-color="green"
                          thumb-color="orange"
                ></v-slider>
            </v-list-item-content>
        </v-list-item>

        <v-list-item>
            <v-list-item-content>
                <v-list-item-title>Инкубационный период</v-list-item-title>
                <v-list-item-subtitle>Как долго проходит инкубационный период</v-list-item-subtitle>
                <v-slider v-model="baseConfigs.infect_time"
                          thumb-label
                          step="100"
                          ticks="always"
                          tick-size="4"
                          min="100"
                          max="5000"
                          track-color="red"
                          track-fill-color="green"
                          thumb-color="orange"
                ></v-slider>
            </v-list-item-content>
        </v-list-item>

    </v-list>
</template>

<script>
    export default {
        name: "CoronaForm",

        data: () => ({
            shopSettings: [
                {name: 'has_shop', title: 'Открытое публичное место', description: 'Место притяжения людей'},
                {name: 'infectable_shop', title: 'Публичное место заразно', description: 'Если место посетил больной, то место становится зараженным'},
                {name: 'shop_go_only_moveable', title: 'Только активные', description: 'Самоизолированные будут сидеть дома'},
            ],

            badSettings: [
                {name: 'infected_can_infect', title: 'Инкубационный период - заразный', description: 'Человек заразен даже если сам не болен, но инфицирован'},
                {name: 'bad_can_move', title: 'Больной не сидит дома', description: 'При плохом самочувствии человек останется дома'},
                {name: 'remove_bad', title: 'Больной изолирован', description: 'Больных людей увозят в неизвестность'},
            ],

            checkedSettings: ['has_shop', 'infectable_shop', 'infected_can_infect', 'bad_can_move'],

            baseConfigs: {
                total_persons: 1000,
                infect_time: 2000,
                shop_time: 100,
                stay_home_percent: 10,
                start_infected: 1,
                infect_percent: 90,
            },
        }),

        methods: {
            getConfigs () {
                let checks = {};

                this.checkedSettings.forEach(c => checks[c] = true);

                return {...this.baseConfigs, ...checks}
            }
        }
    }
</script>

<style scoped>

</style>
