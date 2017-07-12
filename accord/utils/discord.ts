import { Observable } from 'accord/utils/rxjs';
import { Client, Message, StringResolvable, MessageOptions, TextChannel, DMChannel, GroupDMChannel } from 'discord.js';

export function createMessageStream(discordBot: Client, commandPrefix: string): Observable<Message> {
  return Observable.fromEvent<Message>(discordBot, 'message')
    .filter(({ content }) => content.startsWith(commandPrefix))
    .filter(({ author: { bot } }) => !bot);
}

export type Response = {
  content?: StringResolvable,
  options?: MessageOptions,
  recipient: TextChannel | DMChannel | GroupDMChannel,
};

type CommandData = { message: Message, commandPrefix: string };
export type Command = (data$: Observable<CommandData>) => Observable<Response>;

export function createResponseStream(message$: Observable<Message>, commands: Command[], commandPrefix: string): Observable<Response> {
  return commands
    .reduce(
      (mergedResponse$, command) => mergedResponse$.merge(
        command(message$.map(message => ({ message, commandPrefix }))),
      ),
      Observable.empty<Response>(),
    );
}
