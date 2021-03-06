export default
    function DeleteSchedule(GetBasePath, Rest, Wait, $state,
        ProcessErrors, Prompt, Find, $location, $filter) {
        return function(params) {
            var scope = params.scope,
                id = params.id,
                callback = params.callback,
                action, schedule, list, url, hdr;

            if (scope.schedules) {
                list = scope.schedules;
            }
            else if (scope.scheduled_jobs) {
                list = scope.scheduled_jobs;
            }

            url = GetBasePath('schedules') + id + '/';
            schedule = Find({list: list, key: 'id', val: id });
            hdr = 'Delete Schedule';

            action = function () {
                Wait('start');
                Rest.setUrl(url);
                Rest.destroy()
                    .then(() => {
                        $('#prompt-modal').modal('hide');
                        scope.$emit(callback, id);

                        let reloadListStateParams = null;

                        if(scope.schedules.length === 1 && $state.params.schedule_search && !_.isEmpty($state.params.schedule_search.page) && $state.params.schedule_search.page !== '1') {
                            reloadListStateParams = _.cloneDeep($state.params);
                            reloadListStateParams.schedule_search.page = (parseInt(reloadListStateParams.schedule_search.page)-1).toString();
                        }

                        if (parseInt($state.params.schedule_id) === id) {
                            $state.go('^', reloadListStateParams, {reload: true});
                        }
                        else{
                            $state.go('.', reloadListStateParams, {reload: true});
                        }
                    })
                    .catch(({data, status}) => {
                        try {
                            $('#prompt-modal').modal('hide');
                        }
                        catch(e) {
                            // ignore
                        }
                        ProcessErrors(scope, data, status, null, { hdr: 'Error!', msg: 'Call to ' + url +
                            ' failed. DELETE returned: ' + status });
                    });
            };

            Prompt({
                hdr: hdr,
                body: '<div class="Prompt-bodyQuery">Are you sure you want to delete the schedule below?</div><div class="Prompt-bodyTarget">' + $filter('sanitize')(schedule.name) + '</div>',
                action: action,
                actionText: 'DELETE',
                backdrop: false
            });
        };
    }

DeleteSchedule.$inject =
    [   'GetBasePath','Rest', 'Wait', '$state',
        'ProcessErrors', 'Prompt', 'Find', '$location',
        '$filter'
    ];
