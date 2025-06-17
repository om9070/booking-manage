# Booking Management App

1.install docker

2.open the terminal then hit
if any image is running the same project folder
3.docker compose down -v 
then build
4.docker compose build
then start
5.docker compose up

This architecture satisfies all original requirements:
1.Provider availability management
2.Client booking system
3.Admin oversight
4.Secure payments
5.Conflict-free scheduling
6.dockerized
7.implemented cached


1.fristly user can register own profile bahave on the role ['admin','client','admin'].
2.provider can add the available slot if the time slot is available.
3.client can book the available slot bahave on the available slot.
4.provider can add the reccuring as ['once','week','month'].
5. Implemented caching for the booking slot.
6.user strip payment getway to conform any booking slot.
