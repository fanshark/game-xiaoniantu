// npc.js - NPC system with dialogue trees
const NPCSystem = {
    npcs: [],
    activeDialogue: null,
    
    // Dialogue trees
    dialogues: {
        guide_start: {
            speaker: '向导小粘土',
            text: '欢迎来到粘土世界！你是那个勇敢的小粉粘土吧？你的好朋友被山林深处的大怪兽抓走了...\n你需要不断收集粘土成长到15米，才能打败怪兽！',
            choices: [
                { text: '我该怎么成长？', next: 'guide_growth' },
                { text: '大怪兽在哪里？', next: 'guide_boss' },
                { text: '谢谢你！我出发了！', next: null, effect: { coins: 5 } },
            ]
        },
        guide_growth: {
            speaker: '向导小粘土',
            text: '收集散落在地上的粉色粘土球，每个可以让你长大1毫米。\n在菌窟深处打败100只小菌，可以获得传说中的巨型粘土，一下子长大10米！\n但要小心沙漠，每走一步都会缩小1毫米哦！',
            choices: [
                { text: '还有什么要注意的？', next: 'guide_warning' },
                { text: '明白了，出发！', next: null },
            ]
        },
        guide_boss: {
            speaker: '向导小粘土',
            text: '大怪兽藏在东边山林的最深处。但你现在太小了，只有长到15米才能挑战它！\n从这里往东走，穿过草原、海边，再往南穿过沙漠和菌窟，就能到达山林。',
            choices: [
                { text: '我该怎么成长？', next: 'guide_growth' },
                { text: '我会变强的！', next: null },
            ]
        },
        guide_warning: {
            speaker: '向导小粘土',
            text: '⚠️ 特别注意！\n• 有爱心标记的NPC是好人，可以放心交流\n• 没有爱心的会攻击你！\n• 有些NPC看起来有爱心，但爱心会闪烁——那是间谍！\n• 间谍会带你去假商店，千万别跟着去！',
            choices: [
                { text: '怎么分辨间谍？', next: 'guide_spy' },
                { text: '我会小心的！', next: null, effect: { coins: 3 } },
            ]
        },
        guide_spy: {
            speaker: '向导小粘土',
            text: '间谍的爱心标记会不稳定地闪烁，仔细观察就能发现。\n而且间谍说话特别热情，会主动邀请你去"超好的商店"。\n如果你被骗进假商店，会损失金币和体型！记住：真正的好人不会急着带你去商店。',
            choices: [
                { text: '谢谢提醒！', next: null, effect: { coins: 2 } },
            ]
        },
        
        farmer: {
            speaker: '农夫粘土',
            text: '哟！小家伙，你好小啊~ 东边的草丛里藏着很多粘土球哦。\n往南走有个危险的沙漠，如果你不够大，不建议去那里。',
            choices: [
                { text: '南边有什么？', next: 'farmer_south' },
                { text: '有没有什么好东西给我？', next: 'farmer_gift' },
                { text: '再见！', next: null },
            ],
            allowTyping: true,
            keywords: {
                '帮助|help|怎么办': { text: '多捡粘土球就能变大啦！这里到处都有散落的粘土。', effect: null },
                '商店|买|购物': { text: '草原东边有个正规商店，门口有金色标记的，很安全。', effect: null },
                '朋友|friend': { text: '你的朋友...我听说被绑在山林深处了。你要加油啊！', effect: { coins: 2 } },
            }
        },
        farmer_south: {
            speaker: '农夫粘土',
            text: '南边是一片大沙漠，那里很危险！每走一步你都会缩小1毫米。\n不过穿过沙漠就是传说中的菌窟，听说里面有能让你瞬间变巨大的宝物...',
            choices: [
                { text: '我会准备好再去的。', next: null },
            ]
        },
        farmer_gift: {
            speaker: '农夫粘土',
            text: '嗯...你这么小一个还挺有勇气的。给你几个金币吧，去商店买点补给！',
            choices: [
                { text: '太感谢了！', next: null, effect: { coins: 10 } },
            ]
        },
        
        fisher: {
            speaker: '渔夫粘土',
            text: '海边的沙滩上经常冲上来金币，多找找！\n这里的海风很舒服，但远处有些小怪物，小心点。',
            choices: [
                { text: '有什么冒险建议吗？', next: 'fisher_advice' },
                { text: '谢谢！', next: null },
            ],
            allowTyping: true,
            keywords: {
                '宠物|pet|伙伴': { text: '听说海边有位神秘的金色朋友，会送你一只小宠物呢！往南边沙滩找找看。', effect: null },
                '沙漠|desert': { text: '沙漠很危险，建议你至少长到100毫米再去。在商店买些恢复道具也有帮助。', effect: null },
            }
        },
        fisher_advice: {
            speaker: '渔夫粘土',
            text: '建议你先在草原和海边多收集粘土和金币，至少长到100毫米再去沙漠。\n记得在商店买恢复药水，沙漠里会用到的！',
            choices: [
                { text: '好的，我会准备充分的。', next: null, effect: { coins: 5 } },
            ]
        },

        super_good_npc: {
            speaker: '✨ 神秘金色旅者',
            text: '啊...我感应到了你身上的勇气之光！小小的身体里藏着大大的决心呢~\n我要送你一份礼物：一只忠诚的小星宠！它会在战斗中帮助你！',
            choices: [
                { text: '真的吗？太好了！', next: 'super_good_gift' },
                { text: '为什么要帮我？', next: 'super_good_why' },
            ]
        },
        super_good_gift: {
            speaker: '✨ 神秘金色旅者',
            text: '小星宠会跟随你战斗，每次攻击额外造成伤害！\n而且它还能帮你感应周围的危险。好好照顾它哦~',
            choices: [
                { text: '我会好好照顾它的！谢谢！', next: null, effect: { pet: true, petPower: 10 } },
            ]
        },
        super_good_why: {
            speaker: '✨ 神秘金色旅者',
            text: '因为这个世界需要勇敢的人啊。你的朋友在等你，而我相信你能做到。\n拿着这份力量，去救你的朋友吧！',
            choices: [
                { text: '谢谢你的信任！', next: null, effect: { pet: true, petPower: 10 } },
            ]
        },

        spy_intro: {
            speaker: '热情的路人',
            text: '哎呀~小可爱！你好你好！我认识你！你是那个要救朋友的勇敢小粘土对吧？\n我知道一个超级棒的商店，里面的东西又便宜又好！要不要我带你去？',
            choices: [
                { text: '好啊，带我去！', next: 'spy_trap' },
                { text: '不了，谢谢。', next: 'spy_decline' },
                { text: '（仔细观察对方...）', next: 'spy_observe' },
            ],
            allowTyping: true,
            keywords: {
                '间谍|spy|骗子|假': { text: '什......什么？！你怎么知道的！？', next: 'spy_caught' },
                '爱心|heart|标记': { text: '啊，我的爱心标记？它...它当然在啊！（心虚地笑）', next: 'spy_nervous' },
                '不|no|走开|拒绝': { text: '欸？不要这么冷淡嘛~ 真的是好商店啦~', next: 'spy_decline' },
            }
        },
        spy_trap: {
            speaker: '⚠️ 间谍暴露！',
            text: '哈哈哈！上当了吧！这根本不是什么好商店！\n欢迎来到"坑你没商量"假商店！\n💀 你损失了 20金币 和 50毫米体型！',
            choices: [
                { text: '可恶...下次不会再上当了！', next: null, effect: { coins: -20, size: -50 } },
            ]
        },
        spy_decline: {
            speaker: '热情的路人',
            text: '啊...这样啊，好吧好吧。那你自己小心点哦~\n（你注意到对方的爱心标记似乎在闪烁...明智的选择！）',
            choices: [
                { text: '（离开）', next: null },
            ]
        },
        spy_observe: {
            speaker: '系统提示',
            text: '你仔细观察了对方...\n💡 发现：对方胸口的爱心标记在不规律地闪烁！这是间谍的特征！\n真正的好人NPC爱心标记是稳定的。',
            choices: [
                { text: '你是间谍！', next: 'spy_caught' },
                { text: '（默默走开）', next: null, effect: { coins: 5 } },
            ]
        },
        spy_caught: {
            speaker: '间谍粘土',
            text: '可恶！被你发现了！没想到你这么机灵...\n算了算了，我走！下次可不会这么容易被识破！',
            choices: [
                { text: '哼，别想骗我！', next: null, effect: { coins: 10 } },
            ]
        },
        spy_nervous: {
            speaker: '热情的路人',
            text: '（你注意到对方的爱心标记确实在闪烁，不太正常...）\n对方似乎有些紧张了。',
            choices: [
                { text: '你是间谍吧！', next: 'spy_caught' },
                { text: '算了，再见。', next: null },
            ]
        },

        bad_npc: {
            speaker: '⚠️ 敌意粘土',
            text: '嘿！这是我的地盘！交出你的金币，不然别想好过！',
            choices: [
                { text: '我不怕你！（战斗）', next: null, effect: { combat: 'bad_npc_fight' } },
                { text: '（赶紧逃跑）', next: null, effect: { hp: -10 } },
            ]
        },

        // Danger house dialogue
        danger_house: {
            speaker: '⚠️ 危险！',
            text: '你进入了一间可疑的大房子...里面突然冲出来几个大粘土，抢走了你身上的粘土！\n💀 体型 -100毫米！',
            choices: [
                { text: '太可怕了！赶紧逃！', next: null, effect: { size: -100 } },
            ]
        },

        // Fungi cave challenge
        fungi_challenge: {
            speaker: '洞穴之声',
            text: '你来到了传说中的菌窟...这里弥漫着诡异的紫色雾气。\n前方有大量的小菌怪守护着传说中的【巨型粘土】！\n击败它们全部才能获得巨型粘土（+10米体型）！\n但如果你害怕，现在还可以逃跑...',
            choices: [
                { text: '我要挑战！击败它们！', next: null, effect: { startFungiChallenge: true } },
                { text: '太可怕了...我逃跑。', next: 'fungi_flee' },
            ]
        },
        fungi_flee: {
            speaker: '系统',
            text: '你选择了逃跑...\n⚠️ 巨型粘土将永远无法获得！你只能靠一点一点收集小粘土来成长了。\n游戏难度大幅提升！',
            choices: [
                { text: '（含泪离开）', next: null, effect: { fungiChallengeComplete: true } },
            ]
        },

        // Boss dialogue
        boss_encounter: {
            speaker: '🔥 山林巨兽',
            text: '吼！！！又有一个不自量力的小东西来了！\n你以为你能救你的朋友？做梦！\n来吧，让我看看你到底有多强！',
            choices: [
                { text: '为了我的朋友，我不会退缩！', next: null, effect: { startBoss: true } },
            ]
        },

        // Victory
        victory: {
            speaker: '🎉 好朋友',
            text: '呜呜呜...你真的来救我了！我就知道你一定会来的！\n谢谢你...谢谢你一路上的勇敢和坚持！\n我们一起回家吧！',
            choices: [
                { text: '走！我们回家！', next: null, effect: { victory: true } },
            ]
        },

        // Sub-map NPC dialogues
        shopkeeper: {
            speaker: '店主粘土',
            text: '欢迎光临粘土补给站！这里的东西都是正品，放心购买~\n你看起来是在冒险的路上吧？需要什么尽管说！',
            choices: [
                { text: '我要买东西！', next: null, effect: { openShop: true } },
                { text: '有什么推荐的吗？', next: 'shopkeeper_rec' },
                { text: '再见！', next: null },
            ]
        },
        shopkeeper_rec: {
            speaker: '店主粘土',
            text: '如果你要去沙漠的话，一定要买防沙护盾！那里每走一步都会缩小。\n高级粘土块也很值得，一下子能长50毫米呢！',
            choices: [
                { text: '好的，让我看看商品！', next: null, effect: { openShop: true } },
                { text: '谢谢建议！', next: null },
            ]
        },

        cave_hermit: {
            speaker: '✨ 洞穴隐士',
            text: '嘘...你找到了这个秘密洞穴！很少有人能发现这里。\n作为奖励，我可以强化你的宠物...如果你有宠物的话。',
            choices: [
                { text: '请帮我强化！', next: 'cave_hermit_boost' },
                { text: '这里有什么秘密？', next: 'cave_hermit_secret' },
            ]
        },
        cave_hermit_boost: {
            speaker: '✨ 洞穴隐士',
            text: '好的...感受这股力量吧！\n⭐ 宠物战力 +15！',
            choices: [
                { text: '太棒了！谢谢！', next: null, effect: { petPower: 15 } },
            ]
        },
        cave_hermit_secret: {
            speaker: '✨ 洞穴隐士',
            text: '这个洞穴连接着粘土世界的能量源。在这里待一会，你会感觉到力量在增长...\n而且这里的粘土球比外面的更浓缩哦！',
            choices: [
                { text: '帮我强化宠物吧！', next: 'cave_hermit_boost' },
                { text: '我去探索了！', next: null, effect: { size: 30 } },
            ]
        },

        oasis_npc: {
            speaker: '绿洲守护者',
            text: '欢迎来到沙漠中唯一的绿洲！在这里你不会缩小的。\n好好休息一下吧，外面的沙漠可不是闹着玩的。',
            choices: [
                { text: '能帮我恢复体力吗？', next: 'oasis_heal' },
                { text: '沙漠还有多远才能穿过？', next: 'oasis_info' },
                { text: '谢谢，我休息一下。', next: null, effect: { hp: 30 } },
            ]
        },
        oasis_heal: {
            speaker: '绿洲守护者',
            text: '喝点绿洲的泉水吧~ 恢复了50点HP！\n记住，出去后还是会缩小的，做好准备再走哦。',
            choices: [
                { text: '谢谢！', next: null, effect: { hp: 50 } },
            ]
        },
        oasis_info: {
            speaker: '绿洲守护者',
            text: '从这里出去，继续往南走大概10步就能到达菌窟入口。\n⚠️ 提醒：如果你想拿巨型粘土，要在菌窟里打败100只小菌！\n建议至少有200毫米的体型再去挑战。',
            choices: [
                { text: '好的，我准备好了！', next: null },
                { text: '先让我恢复一下...', next: 'oasis_heal' },
            ]
        },

        fake_shopkeeper: {
            speaker: '⚠️ 假店老板',
            text: '哈哈！欢迎来到我的"商店"！\n可惜你已经中计了！这里什么都买不到！',
            choices: [
                { text: '可恶！（赶紧逃跑）', next: null, effect: { coins: -15, size: -30 } },
            ]
        },

        home_resident: {
            speaker: '🏠 小屋主人',
            text: '哎呀，有客人来了！快请坐~\n这是我的小家，虽然不大但很温暖。你冒险累了吧？',
            choices: [
                { text: '好温暖！能让我休息一下吗？', next: 'home_rest' },
                { text: '外面是什么情况？', next: 'home_info' },
                { text: '谢谢，我只是路过~', next: null },
            ]
        },
        home_rest: {
            speaker: '🏠 小屋主人',
            text: '当然可以！来喝杯热茶吧~ ☕\n恢复了30点HP，身体也长大了一点点！\n下次路过也欢迎来坐坐哦！',
            choices: [
                { text: '谢谢你的好意！', next: null, effect: { hp: 30, size: 5 } },
            ]
        },
        home_info: {
            speaker: '🏠 小屋主人',
            text: '往东走是一大片绿草原，那里有商店可以买东西。\n不过要小心，草原上有些绿色史莱姆会靠近你！\n⚔1级的最弱，你肯定打得过~',
            choices: [
                { text: '好的，我知道了！', next: null },
                { text: '让我休息一下再出发', next: 'home_rest' },
            ]
        },

        museum_curator: {
            speaker: '🏛️ 馆长',
            text: '欢迎来到粘土博物馆！这里收藏着关于粘土世界的珍贵历史。\n你知道吗？传说中最大的粘土曾经有100米高呢！',
            choices: [
                { text: '给我讲讲粘土的历史！', next: 'museum_history' },
                { text: '有什么能帮助我冒险的吗？', next: 'museum_tip' },
                { text: '我去看看展品~', next: null, effect: { size: 3 } },
            ]
        },
        museum_history: {
            speaker: '🏛️ 馆长',
            text: '很久以前，粘土世界到处都是友善的小粘土们。后来黑暗菌入侵了山林地区，把你的好朋友困在了那里！\n只有成长到15米的超级粘土才能打败山林巨兽...\n收集粘土球、击败敌人都会让你变大哦！',
            choices: [
                { text: '我一定会救出朋友的！', next: null, effect: { size: 5 } },
                { text: '还有别的秘密吗？', next: 'museum_secret' },
            ]
        },
        museum_secret: {
            speaker: '🏛️ 馆长',
            text: '嘘...我告诉你一个秘密：\n🔮 菌窟里打败100只小菌可以获得巨型粘土，一下子+10米！\n🐾 海边有个金色的NPC会送你宠物伙伴，战斗力大增！\n📚 海边的图书馆也有不少有用的知识~',
            choices: [
                { text: '太有用了，谢谢馆长！', next: null, effect: { size: 10 } },
            ]
        },
        museum_tip: {
            speaker: '🏛️ 馆长',
            text: '冒险小贴士：\n1️⃣ 先去海边找宠物，有伙伴攻击力会变强\n2️⃣ 沙漠每步缩小1mm，准备好再去\n3️⃣ 商店有防沙护盾，很有用\n4️⃣ 记得常用H键查看进度提示！',
            choices: [
                { text: '记住了！', next: null },
            ]
        },

        librarian: {
            speaker: '📚 图书管理员',
            text: '欢迎来到知识图书馆！这里收集了世界各地的粘土知识。\n知识就是力量～想看看什么类型的书？',
            choices: [
                { text: '战斗技巧', next: 'library_combat' },
                { text: '世界地图知识', next: 'library_map' },
                { text: '神秘传说', next: 'library_legend' },
            ]
        },
        library_combat: {
            speaker: '📚 图书管理员',
            text: '《粘土战斗手册》：\n🗡️ 空格或Z键攻击，攻击有冷却时间\n🛡️ 宠物会自动辅助攻击\n💪 体型越大，血量越高\n📖 读完这本书，感觉战斗力提升了！',
            choices: [
                { text: '学到了！谢谢！', next: null, effect: { attackPower: 2 } },
            ]
        },
        library_map: {
            speaker: '📚 图书管理员',
            text: '《粘土世界地图册》：\n🌿 起始小路 → 翠绿草原 → 海边沙滩\n🏜️ 草原南边 → 危险沙漠 → 菌窟深处\n⛰️ 菌窟东边 → 山林终极区（Boss在那里！）\n📍 各区域都有建筑可以进入探索~',
            choices: [
                { text: '路线记住了！', next: null },
            ]
        },
        library_legend: {
            speaker: '📚 图书管理员',
            text: '《粘土世界的传说》：\n✨ 据说有一块远古粘土，蕴含着整个世界的能量...\n🔑 只有打败山林巨兽的勇者才能见到被困的朋友\n🌟 朋友被救出后，粘土世界就会恢复和平\n📖 这些知识让你更加坚定了信念！',
            choices: [
                { text: '我一定会成功的！', next: null, effect: { size: 8 } },
            ]
        }
    },

    loadNPCs(zoneName) {
        const zone = ZONES[zoneName];
        if (!zone) return;
        this.npcs = zone.spawnNPCs();
    },

    getNPCAt(tileX, tileY) {
        for (const npc of this.npcs) {
            if (Math.abs(npc.x - tileX) <= 1 && Math.abs(npc.y - tileY) <= 1) {
                return npc;
            }
        }
        return null;
    },

    startDialogue(dialogueId) {
        const dialogue = this.dialogues[dialogueId];
        if (!dialogue) return null;
        this.activeDialogue = dialogueId;
        return dialogue;
    },

    getDialogue(dialogueId) {
        return this.dialogues[dialogueId] || null;
    },

    processKeywordInput(text, dialogueId) {
        const dialogue = this.dialogues[dialogueId];
        if (!dialogue || !dialogue.keywords) return null;
        
        for (const [pattern, response] of Object.entries(dialogue.keywords)) {
            const regex = new RegExp(pattern, 'i');
            if (regex.test(text)) {
                return response;
            }
        }
        return { text: '（对方似乎不太理解你的话...）', effect: null };
    },

    applyEffect(effect) {
        if (!effect) return;
        
        if (effect.coins) {
            Player.coins = Math.max(0, Player.coins + effect.coins);
        }
        if (effect.size) {
            Player.grow(effect.size);
        }
        if (effect.hp) {
            if (effect.hp > 0) {
                Player.heal(effect.hp);
            } else {
                Player.takeDamage(-effect.hp);
            }
        }
        if (effect.pet) {
            Player.hasPet = true;
        }
        if (effect.petPower) {
            Player.petPower += effect.petPower;
            Player.attackPower += effect.petPower;
        }
        if (effect.openShop) {
            Shop.openRealShop();
        }
        if (effect.attackPower) {
            Player.attackPower += effect.attackPower;
        }
        if (effect.startFungiChallenge) {
            Player.fungiChallengeActive = true;
        }
        if (effect.fungiChallengeComplete) {
            Player.fungiChallengeComplete = true;
        }
        if (effect.startBoss) {
            // Handled by main game loop
        }
        if (effect.victory) {
            Player.friendRescued = true;
        }
    }
};
