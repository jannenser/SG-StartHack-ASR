# SG-StartHack-ASR
Voice Assistant based on Speech Recognition From Swiss German and High German

## Use of Swiss German Voice Assistant

To check Voice-Chat in Telegram reach the Telegram-bot = @SwissGerman (not on the server, you will need to contact us to put it on OR you can test it yourself.
You will need to send a voice message with the question to Canton of Sankt Gallen, the reply will be a text message with redirection to responsible authorities on your topic (e.g. taxes, migration office).

## Installation of Telegram-bot

To check the decoding for Telegram-bot you should run the file ..., it is important to keep files beam_search_decoder_ASR_telegram.py, new-swiss_kenlm.bin, lexicon-2.txt in the same directory. But you also need to have your own TOKEN for the bot.

## Use of High German Assistant

## Files description
1. Substitution of numbers in text; spell_numbers_in_german.ipynb
2. Main jupyter notebook with both data preparation and model training; audio_model_training_sg.ipynb
3. Building and integration of KenLM Language Model; kenlm-swiss-german.ipynb
4. Testing the sample audio data code; beam_search_decoder_ASR_telegram.py
5. Integration with decoding TelegramBot: 
6. Different .csv files with mapping filename.wav-utterance: bern.csv - 40k audios from corpus of Bern Parliament, swiss_sg.csv - 500 audios (own recorded) on SG call center topics
7. Files with SG call center transcription: SG_1-4.xlsx
8. Swiss German vocabulary, based on text data, needed for ctc decoder: lexicon-2.txt
9. KenLm Swiss German Language Model, based on text data: new-swiss_kenlm.bin
10. Best ASR model from Swiss Speech to text: model-v2.pth (90 MB)

## ASR Swiss Speech Model View
![My new deepspeech](new_deepspeech.png)
