Se vuoi CANCELLARE completamente l'ultima commit (hard reset)
bash
Copia
Modifica
git reset --hard HEAD~1
git push --force
git reset --hard HEAD~1 ➔ torna indietro di una commit cancellando anche i file

git push --force ➔ forza la riscrittura sulla remote (ATTENZIONE: sovrascrivi la storia, non farlo se lavorate in tanti sul branch!)

2. Se vuoi ANNULLARE l'ultima commit ma conservare i file (soft reset)
   bash
   Copia
   Modifica
   git reset --soft HEAD~1
   git push --force
   git reset --soft HEAD~1 ➔ torna indietro di una commit ma lascia i file modificati nello stage (come se li stessi per committare di nuovo)

git push --force ➔ aggiorna la remote.

Quando usare quale?

Caso Comando migliore
Voglio cancellare tutto (anche modifiche) git reset --hard HEAD~1
Voglio correggere la commit e rifarla meglio git reset --soft HEAD~1
EXTRA: Se vuoi solo "correggere" l'ultima commit
Se il problema è che hai sbagliato messaggio o dimenticato un file, puoi anche fare:

bash
Copia
Modifica
git commit --amend
git push --force
Ti fa modificare l'ultima commit senza distruggerla.

È più sicuro di un reset totale.
