from aiogram import Bot, Dispatcher, executor, types
from pydub import AudioSegment
import beam_decoder_telegram
import topics_config
import bot_token

bot = Bot(bot_token.token())
dp = Dispatcher(bot)
i = bot_token.id()
topic_dict = topics_config.dictionary()


@dp.message_handler(content_types=['voice'])
async def start(message: types.Message):
    # download audio
    global i
    i += 1
    file_id = message.voice.file_id
    file = await bot.get_file(file_id)
    file_path = file.file_path
    await bot.download_file(file_path, "temp" + str(i) + ".ogg")

    # convert ogg to wav
    src = "{temp}.ogg".format(temp="temp" + str(i))
    dst = "{temp}.wav".format(temp="temp" + str(i))
    sound = AudioSegment.from_ogg(src)
    sound.export(dst, format="wav")
    s = beam_decoder_telegram.decode_telegram_message(dst)
    topic_names = {"migration": 0, "taxes": 0, "transport": 0, 'safety': 0, 'address': 0, 'opentimes': 0, 'health': 0,
                   'social': 0}
    answer = "answer"
    flag = False
    unpredictable_flag = False
    if len(s[1]) == 0:
        await message.answer(
            "Entschuldigung, wir haben Ihre Frage nicht verstanden. Bitte warten Sie, wir leiten Sie an unserer Mitarbeiter weiter.")
    else:
        words = s[1].split()
        for word in words:
            if word in topic_dict:
                for j in topic_dict[word]:
                    topic_names[j] += 1
                    if topic_names[j] == 1:
                        if flag:
                            unpredictable_flag = True
                        else:
                            flag = True
                            answer = j
        if unpredictable_flag or (not flag):
            await message.answer(
                "Entschuldigung, wir haben Ihre Frage nicht verstanden. Bitte warten Sie, wir leiten Sie an unserer Mitarbeiter weiter.")
        else:
            await message.answer(answer)


executor.start_polling(dp)
