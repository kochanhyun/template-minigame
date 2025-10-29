import { SlashCommandBuilder } from '@discordjs/builders';
import { ChatInputCommandInteraction } from 'discord.js';
import { channelWordRelay } from '../gameState';
import { updateStat } from '../utils/stats';

// 명령어 정의
export const data = new SlashCommandBuilder()
    .setName('word-relay')
    .setNameLocalizations({ ko: '끝말잇기' })
    .setDescription('Start or continue word relay game')
    .setDescriptionLocalizations({ ko: '끝말잇기 게임을 시작하거나 이어갑니다' })
    .addStringOption(option =>
        option
            .setName('word')
            .setNameLocalizations({ ko: '단어' })
            .setDescription('Enter a word')
            .setDescriptionLocalizations({ ko: '단어를 입력하세요' })
            .setRequired(true)
    );

/**
 * word-relay 명령어 실행
 */
export async function execute(interaction: ChatInputCommandInteraction) {
    const word = interaction.options.getString('word', true).trim();
    const channelId = interaction.channelId;
    
    // 한글만 허용 (간단한 검사)
    if (!/^[가-힣]+$/.test(word)) {
        await interaction.reply({
            content: '❌ 한글 단어만 입력할 수 있습니다!',
            ephemeral: true
        });
        return;
    }
    
    const gameState = channelWordRelay.get(channelId);
    
    if (!gameState) {
        // 새 게임 시작
        channelWordRelay.set(channelId, {
            lastWord: word,
            lastUserId: interaction.user.id
        });
        
        updateStat(interaction.user.id, 'wordrelay', { words: 1 });
        
        await interaction.reply({
            content: `💬 끝말잇기 시작!\n\n시작 단어: **${word}**\n다음 사람은 **"${word[word.length - 1]}"**(으)로 시작하는 단어를 입력하세요!`
        });
    } else {
        const lastWord = gameState.lastWord;
        const lastChar = lastWord[lastWord.length - 1];
        const firstChar = word[0];
        
        // 같은 사람이 연속으로 입력하는지 확인
        if (gameState.lastUserId === interaction.user.id) {
            await interaction.reply({
                content: '❌ 같은 사람이 연속으로 입력할 수 없습니다!',
                ephemeral: true
            });
            return;
        }
        
        // 끝말잇기 규칙 확인
        if (lastChar !== firstChar) {
            await interaction.reply({
                content: `❌ **"${lastChar}"**(으)로 시작하는 단어를 입력해야 합니다!`,
                ephemeral: true
            });
            return;
        }
        
        // 성공
        gameState.lastWord = word;
        gameState.lastUserId = interaction.user.id;
        
        updateStat(interaction.user.id, 'wordrelay', { words: 1 });
        
        await interaction.reply({
            content: `✅ **${word}**\n다음 사람은 **"${word[word.length - 1]}"**(으)로 시작하는 단어를 입력하세요!`
        });
    }
}
