<template>
    <div>
        <button style="margin-left: 90%;" @click="print(formDataObj.id)">打印</button>
    </div>
    <div id="printTemplate" ref="printTemplateRef" v-if="formDataObj">
        <div class="header">
            <img src="~/assets/ICON1024PX.png" width="100" style="margin:10px 10px">
            <div class="desc">纳管家施工结算单</div>
            <div class="link-top"></div>
        </div>
        <div class="titleArea">
            <div class="item">
                <div class="itemDesc">
                    施工单号<span style="font-size: 10px;">TRANS.NUM</span>

                </div>
                <div class="itemDesc">
                    {{ formDataObj.code }}

                </div>

            </div>

            <div class="item">
                <div class="itemDesc">
                    顾客<span style="font-size: 10px;">COUSTOMER</span>

                </div>
                <div class="itemDesc">
                    {{ formDataObj.userName || 'coustmer' }}

                </div>

            </div>

            <div class="item">
                <div class="itemDesc">
                    预计完成日期<span style="font-size: 10px;">TRANS.NUM</span>
                </div>
                <div class="itemDesc">
                    {{ formDataObj.expectComplete }}
                </div>
            </div>

            <div class="item">
                <div class="itemDesc">
                    电话<span style="font-size: 10px;">TELPHONE</span>
                </div>
                <div class="itemDesc">
                    {{ formDataObj.phoneNumber }}
                </div>
            </div>

            <div class="item">
                <div class="itemDesc">
                    车辆<span style="font-size: 10px;">CAR.NAME</span>
                </div>
                <div class="itemDesc">
                    {{ formDataObj.carName }}
                </div>
            </div>
            <div class="item">
                <div class="itemDesc">
                    车牌号码<span style="font-size: 10px;">CAR.NUM</span>
                </div>
                <div class="itemDesc">
                    {{ formDataObj.carNumber }}
                </div>
            </div>

        </div>
        <div v-for="(itemProType, indexProType) in formDataObj.newconstructionSku" :key="indexProType"
            class="contentArea">
            <div class="header">
                <div class="item">
                    <div class="li">
                        #
                    </div>
                    <div class="li">
                        施工项目
                    </div>
                </div>
                <div class="item">
                    <div class="li">
                        配件名称
                    </div>
                    <div class="li">
                        数量
                    </div>
                </div>
            </div>

            <div v-for="(itemPosition, indexPosition) in itemProType.productPosition" :key="indexPosition"
                class="content">
                <div class="item">
                    <div class="li">
                        {{ indexPosition + 1 }}
                    </div>
                    <div class="li">
                        {{ itemPosition.productSkuName }}
                    </div>
                </div>
                <div class="item">
                    <div class="li">
                        {{ itemProType.productModelName }}-{{ itemProType.productName }}
                    </div>
                    <div class="li">
                        X1
                    </div>
                </div>

            </div>

        </div>

        <div class="priceArea">
            <div class="priceOther">
                <div class="label">
                    总数量 QUANTITY
                </div>
                <div class="value">
                    {{ formDataObj.constructionSku.length }}
                </div>
            </div>
            <div class="link-bottom"></div>
            <div class="priceOther">
                <div class="label">
                    其他费用 <span class="zhle">OTHERPRICE</span>
                </div>
                <div class="value">
                    {{ formDataObj.settlement.otherPrice / 100 }}
                </div>
            </div>

            <div class="priceOther">
                <div class="label">
                    总金额 <span class="zhl">COUNTPRICE</span>
                </div>
                <div class="value">
                    {{ formDataObj.settlement.price / 100 }}
                </div>
            </div>
            <div class="priceCount">
                <div class="label">
                    客户签字 SIGNATURE
                </div>

            </div>
            <div class="link-bottom"></div>



        </div>

        <div class="footArea">
            <div class="title">感谢您对我们的信任！</div>
            <div class="titleDesc">Thank You For Your Trust!</div>
            <div class="link-top"></div>
        </div>



    </div>
</template>

<script>
import {
    ref,
    computed,
    onMounted,
    onBeforeUnmount,
    defineComponent,
    reactive,
    toRefs,
} from 'vue';
import { useBaseStore } from 'stores/base';
import { useRoute } from 'vue-router';
import { useQuasar, useMeta, date } from 'quasar';
import { api } from 'boot/axios';

import CheckboxComponent from 'components/CheckboxComponent.vue';
import RadioOption from 'components/RadioOption.vue';
import PhotoswipeComponent from 'components/PhotoswipeComponent.vue';

const metaData = {
    // sets document title
    title: '销售单详情',
};

export default defineComponent({
    name: 'construction-saleSlip',

    components: {
        // CheckboxComponent,
        // PhotoswipeComponent,
    },

    setup() {
        const $q = useQuasar();
        const store = useBaseStore();
        const $route = useRoute();

        const { id } = $route.params;

        const formDataObj = ref();

        const printTemplateRef = ref(null);

        const brandName = '纳管家';

        const print = () => {
            const printWindow = window.open('', '_blank');
            if (printWindow) {
                const printContent = printTemplateRef.value.innerHTML;
                printWindow.document.write(`
                <html>
                    <head>
                    <title>${brandName}</title>
                    <style>
                    * {
                        font-weight: 500
                    }
                    .zhle {
                        margin-left:0px
                    }
                    .zhl {
                        margin-left:12px
                    }
                    .link-bottom{
                        margin: 5px 5px;
                        width: 32%;
                        height: 1px;
                        margin-left: 65%;
                        border-top: solid #000 1px;
                    }

                    .header {
                        display: flex;
                        flex-direction: column;
                        align-items: center;
                    }

                    .header .desc {
                        font-size: 20px;
                        font-weight: bold
                    }

                    .link-top {
                        margin: 10px 10px;
                        width: 100%;
                        height: 3px;
                        border-top: solid #000 3px;
                    }

                    .titleArea {
                        display: flex;
                        flex-direction: row;
                        flex-wrap: wrap;
                        align-items: center;
                        justify-content: center;
                        width: 100%;
                        margin-left:10%
                    }

                    .titleArea .item {
                        width: 50%;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        

                    }

                    .item .itemDesc {
                        font-size: 10px;
                        width: 50%;
                        margin-bottom: 6px;
                        word-break: break-all;
                        overflow-wrap: break-word;
                    }

                    .contentArea {
                        display: flex;
                        flex-direction: column;
                        align-items: center;

                    }

                    .contentArea .header {
                        display: flex;
                        flex-direction: row;
                        height: 34px;
                        width: 100%;
                        background-color: #e0e0e0;

                    }

                    .contentArea .header .item {
                        width: 50%;
                        display: flex;
                        justify-content: center;
                        align-items: center;

                    }

                    .contentArea .header .item .li {
                        width: 50%;
                        margin-left: 20%;
                        font-size: 13px;
                        font-weight: bold;
                    }

                    .contentArea .content {
                        display: flex;
                        flex-direction: row;
                        height: 34px;
                        width: 100%;
                    }

                    .contentArea .content .item {
                        width: 50%;
                        display: flex;
                        justify-content: center;
                    }

                    .contentArea .content .item .li {
                        width: 50%;
                        margin-left: 20%;
                        font-size: 10px;
                    }
                    
                    .priceArea {

                    display: flex;
                    flex-direction: column;
                    width: 100%;
                    }

                    .priceArea .priceOther {
                    display: flex;
                    flex-direction: row;
                    font-size:12px
                    }

                    .priceArea .priceOther .label {
                    width: 30%;
                    margin-left: 65%;
                    }

                    .priceArea .priceOther .value {
                    width: 10%;
                    }


                    .priceArea .priceCount {
                    display: flex;
                    flex-direction: row;
                    font-size: 16px;
                    font-weight: bold;
                    margin-top:10px;
                    margin-bottom:10px
                    }

                    .priceArea .priceCount .label {
                    width: 30%;
                    margin-left: 65%;
                    }

                    .priceArea .priceCount .value {
                    width: 10%;

                    }

                    .footArea {
                        /* border: solid; */
                        display: flex;
                        flex-direction: column;
                        align-items: center;
                    }

                    .footArea .title {
                        font-size: 15px;
                        font-weight: bold;
                        color: #e0e0e0;
                        margin-right: 66%;
                        margin-bottom: 5px;
                    }

                    .footArea .titleDesc {
                        font-size: 15px;
                        font-weight: bold;
                        color: #e0e0e0;
                        margin-right: 60%;
                        margin-bottom: 10px;
                    }
                    </style>
                    </head>
                    <body>${printContent}</body>
                </html>
                `);
                printWindow.document.close();
                printWindow.print();
            }
        };


        // 缺陷部位
        const defectPartList = ref([
            { label: '引擎盖', value: 1 },
            { label: '前保险杠', value: 2 },
            { label: '后保险杠', value: 3 },
            { label: '车顶', value: 4 },
            { label: '后翼', value: 5 },
            { label: '后盖箱', value: 6 },
            { label: '左前翼子板', value: 7 },
            { label: '右前翼子板', value: 8 },
            { label: '左后翼子板', value: 9 },
            { label: '右后翼子板', value: 10 },
            { label: '左后视镜', value: 11 },
            { label: '右后视镜', value: 12 },
            { label: '前左侧门', value: 13 },
            { label: '后左侧门', value: 14 },
            { label: '右前门', value: 15 },
            { label: '右后门', value: 16 },
            { label: '仪表号', value: 17 },
            { label: '车灯', value: 18 },
            { label: '座椅', value: 19 },
            { label: '车窗', value: 20 },
        ]);

        // 缺陷原因
        const defectTypeList = ref([
            { label: '划痕', value: 1 },
            { label: '凹凸', value: 2 },
            { label: '脱漆', value: 3 },
            { label: '破损', value: 4 },
            { label: '补漆', value: 5 },
        ]);

        const loadData = () => {
            api
                .get(`/construction/${id}`)
                .then((payload) => {
                    // console.log(payload);

                    payload.expectComplete = date.formatDate(
                        payload.expectComplete * 1000,
                        'YYYY-MM-DD HH:mm:ss'
                    );

                    payload.deadline = date.formatDate(
                        payload.deadline * 1000,
                        'YYYY-MM-DD HH:mm:ss'
                    );

                    // 施工部位
                    let constructionSku = [...payload.constructionSku];

                    let keyInx = {};
                    for (var i = 0; i < constructionSku.length; i++) {
                        var id = constructionSku[i].productId;
                        constructionSku[i].productPosition = [
                            {
                                // productPositionId: constructionSku[i].productPositionId,

                                productSkuName: constructionSku[i].productSkuName,
                                rollNumber: constructionSku[i].rollNumber,
                                employeeName: constructionSku[i].employeeName,
                                length: constructionSku[i].length,
                            },
                        ];

                        if (keyInx[id] >= 0) {
                            var product1 = constructionSku[i].productPosition;
                            var product2 = constructionSku[keyInx[id]].productPosition;
                            constructionSku[keyInx[id]].productPosition =
                                product1.concat(product2);
                            constructionSku.splice(i, 1);
                            i--;
                        } else {
                            keyInx[id] = i;
                        }
                    }
                    payload.newconstructionSku = constructionSku;

                    formDataObj.value = { ...payload };
                    console.log(formDataObj.value);
                })
                .catch((e) => {
                    $q.notify({
                        color: 'negative',
                        position: 'top',
                        message: '加载失败!' + e,
                        icon: 'report_problem',
                    });
                })
                .finally(() => {
                    $q.loading.hide();
                });
        };

        // needs to be called in setup()
        useMeta(metaData);

        //
        onMounted(() => {
            // const hostUri = store.hostUri;
            // console.log('当前url', hostUri);

            loadData();
        });

        return {
            formDataObj,
            defectPartList,
            defectTypeList,
            printTemplateRef,
            print
        };
    },
});
</script>
<style>
* {
    font-weight: 500
}

.zhl {
    margin-left: 14px
}

.link-bottom {
    margin: 5px 5px;
    width: 18%;
    height: 3px;
    margin-left: 80%;
    border-top: solid #000 3px;
}

.header {
    display: flex;
    flex-direction: column;
    align-items: center;
}

.header .desc {
    font-size: 20px;
    font-weight: bold
}

.link-top {
    margin: 10px 10px;
    width: 100%;
    height: 3px;
    border-top: solid #000 3px;
}

.titleArea {
    /* border: solid; */
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    align-items: center;
    justify-content: center;
    width: 100%;
}

.titleArea .item {
    width: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
}

.item .itemDesc {
    font-size: 15px;
    /* border: solid; */
    width: 50%;
    margin-left: 20%;

}

.contentArea {
    display: flex;
    flex-direction: column;
    align-items: center;

}

.contentArea .header {
    display: flex;
    flex-direction: row;
    height: 34px;
    width: 100%;
    background-color: #e0e0e0;

}

.contentArea .header .item {
    width: 50%;
    display: flex;
    justify-content: center;
    align-items: center;
    font-weight: bold;
    font-size: 13px;

}

.contentArea .header .item .li {
    width: 50%;
    margin-left: 20%;
    font-size: 13px;
    font-weight: bold;
}

.contentArea .content {
    display: flex;
    flex-direction: row;
    height: 34px;
    width: 100%;
}

.contentArea .content .item {
    width: 50%;
    display: flex;
    justify-content: center;
}

.contentArea .content .item .li {
    width: 50%;
    margin-left: 20%;
    font-size: 13px;
}



.priceArea {

    display: flex;
    flex-direction: column;
    width: 100%;
}

.priceArea .priceOther {
    display: flex;
    flex-direction: row;
}

.priceArea .priceOther .label {
    width: 12%;
    margin-left: 80%;
}

.priceArea .priceOther .value {
    width: 5%;
}


.priceArea .priceCount {
    display: flex;
    flex-direction: row;
    font-size: 16px;
    font-weight: bold;
}

.priceArea .priceCount .label {
    width: 12%;
    margin-left: 80%;
}

.priceArea .priceCount .value {
    width: 5%;

}



.footArea {
    /* border: solid; */
    display: flex;
    flex-direction: column;
    align-items: center;
}

.footArea .title {
    font-size: 20px;
    font-weight: bold;
    color: #e0e0e0;
    margin-right: 68%;
    margin-bottom: 20px;
}

.footArea .titleDesc {
    font-size: 20px;
    font-weight: bold;
    color: #e0e0e0;
    margin-right: 66%;
    margin-bottom: 10px;
}
</style>